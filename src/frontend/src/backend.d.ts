import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface PaymentRecord {
    id: bigint;
    customerName: string;
    status: string;
    createdAt: bigint;
    amount: number;
    transactionId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentCount(): Promise<bigint>;
    getPaymentHistory(): Promise<Array<PaymentRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(transactionId: string, customerName: string, amount: number, status: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
