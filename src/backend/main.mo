import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  
  public type UserProfile = {
    name : Text;
  };

  type PaymentRecord = {
    id : Nat;
    transactionId : Text;
    customerName : Text;
    amount : Float;
    status : Text;
    createdAt : Int;
  };

  func comparePaymentsByTime(p1 : PaymentRecord, p2 : PaymentRecord) : Order.Order {
    Int.compare(p2.createdAt, p1.createdAt);
  };

  var nextPaymentId = 0;
  let payments = Map.empty<Nat, PaymentRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Payment functions
  public shared ({ caller }) func recordPayment(
    transactionId : Text,
    customerName : Text,
    amount : Float,
    status : Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };

    if (transactionId.isEmpty() or customerName.isEmpty() or amount <= 0.0 or (status != "SUCCESS" and status != "FAILED")) {
      Runtime.trap("Invalid input. Please make sure all fields are valid.");
    };

    let duplicate = payments.values().any(func(p) { p.transactionId == transactionId });
    if (duplicate) {
      Runtime.trap("Duplicate transactionId found. Please use a unique transactionId.");
    };

    let payment : PaymentRecord = {
      id = nextPaymentId;
      transactionId;
      customerName;
      amount;
      status;
      createdAt = Time.now();
    };

    payments.add(nextPaymentId, payment);
    nextPaymentId += 1;
    payment.id;
  };

  public query func getPaymentHistory() : async [PaymentRecord] {
    payments.values().toArray().sort(
      comparePaymentsByTime
    );
  };

  public query func getPaymentCount() : async Nat {
    payments.size();
  };
};
