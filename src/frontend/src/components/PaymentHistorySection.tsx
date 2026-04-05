import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaymentRecord } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ── Utility: nanoseconds bigint → Date ───────────────────────────────────────
function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

// ── Utility: generate pseudo-UUID ────────────────────────────────────────────
function generateTxnId(): string {
  const hex = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0");
  return `TXN-${hex()}${hex()}-${hex()}-${hex()}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function GoldButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  "data-ocid": dataOcid,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  "data-ocid"?: string;
}) {
  const base: React.CSSProperties = {
    borderRadius: "8px",
    padding: "9px 20px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    letterSpacing: "0.02em",
    border: "none",
    opacity: disabled ? 0.55 : 1,
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "oklch(var(--gold))", color: "#0B0B0B" },
    outline: {
      ...base,
      background: "transparent",
      color: "oklch(var(--gold))",
      border: "1px solid oklch(var(--gold) / 50%)",
    },
    ghost: {
      ...base,
      background: "oklch(var(--gold) / 8%)",
      color: "oklch(var(--gold))",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-ocid={dataOcid}
      style={styles[variant]}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 0 12px oklch(var(--gold) / 25%)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === "SUCCESS";
  return (
    <Badge
      style={{
        background: isSuccess
          ? "oklch(0.48 0.14 148 / 20%)"
          : "oklch(0.5 0.2 25 / 20%)",
        color: isSuccess ? "oklch(0.75 0.14 148)" : "oklch(0.72 0.18 25)",
        border: `1px solid ${isSuccess ? "oklch(0.6 0.14 148 / 40%)" : "oklch(0.6 0.18 25 / 40%)"}`,
        fontWeight: 600,
        fontSize: "11px",
        letterSpacing: "0.05em",
        padding: "2px 10px",
        borderRadius: "999px",
      }}
    >
      {isSuccess ? "✓ SUCCESS" : "✗ FAILED"}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2" data-ocid="payment-history.loading_state">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
          key={i}
          className="h-12 w-full rounded-lg"
          style={{ background: "oklch(var(--gold) / 6%)" }}
        />
      ))}
    </div>
  );
}

// ── Admin Add Payment Form ────────────────────────────────────────────────────
function AddPaymentForm({ onAdded }: { onAdded: () => void }) {
  const { actor } = useActor();
  const [open, setOpen] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"SUCCESS" | "FAILED">("SUCCESS");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputStyle: React.CSSProperties = {
    background: "#000",
    border: "1px solid oklch(var(--gold) / 50%)",
    color: "oklch(var(--gold))",
    borderRadius: "7px",
    padding: "9px 13px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    const finalTxnId = txnId.trim() || generateTxnId();
    const name = customerName.trim();
    const amt = Number(amount);
    if (!name) return;
    if (Number.isNaN(amt) || amt <= 0) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await actor.recordPayment(finalTxnId, name, amt, status);
      setFeedback({ type: "success", msg: "Payment recorded successfully." });
      setTxnId("");
      setCustomerName("");
      setAmount("");
      setStatus("SUCCESS");
      onAdded();
    } catch {
      setFeedback({
        type: "error",
        msg: "Failed to record payment. Please try again.",
      });
    } finally {
      setSubmitting(false);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div
      className="rounded-xl mb-6"
      style={{
        background: "oklch(var(--gold) / 4%)",
        border: "1px solid oklch(var(--gold) / 25%)",
        overflow: "hidden",
      }}
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        data-ocid="payment-history.open_modal_button"
        className="flex items-center justify-between w-full px-5 py-4"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-2.5">
          <Plus className="w-4 h-4" style={{ color: "oklch(var(--gold))" }} />
          <span
            className="text-sm font-bold tracking-wide uppercase"
            style={{ color: "oklch(var(--gold))" }}
          >
            Admin: Add Test Payment
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: "oklch(var(--gold))",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="add-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <form
              onSubmit={handleSubmit}
              className="px-5 pb-5 grid sm:grid-cols-2 gap-4"
              data-ocid="payment-history.modal"
            >
              {/* Transaction ID */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ph-txn-id"
                  style={{
                    color: "oklch(var(--gold-muted))",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Transaction ID
                  <span
                    className="ml-1 normal-case"
                    style={{
                      color: "oklch(var(--gold) / 50%)",
                      fontSize: "11px",
                    }}
                  >
                    (auto-generated if empty)
                  </span>
                </label>
                <input
                  id="ph-txn-id"
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder={generateTxnId()}
                  style={inputStyle}
                  data-ocid="payment-history.input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(var(--gold))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "oklch(var(--gold) / 50%)";
                  }}
                />
              </div>

              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ph-cust-name"
                  style={{
                    color: "oklch(var(--gold-muted))",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Customer Name *
                </label>
                <input
                  id="ph-cust-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  style={inputStyle}
                  data-ocid="payment-history.input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(var(--gold))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "oklch(var(--gold) / 50%)";
                  }}
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ph-amount"
                  style={{
                    color: "oklch(var(--gold-muted))",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Amount (₹) *
                </label>
                <input
                  id="ph-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  required
                  style={inputStyle}
                  data-ocid="payment-history.input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(var(--gold))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "oklch(var(--gold) / 50%)";
                  }}
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ph-status"
                  style={{
                    color: "oklch(var(--gold-muted))",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Status *
                </label>
                <select
                  id="ph-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "SUCCESS" | "FAILED")
                  }
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                  }}
                  data-ocid="payment-history.select"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(var(--gold))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "oklch(var(--gold) / 50%)";
                  }}
                >
                  <option
                    value="SUCCESS"
                    style={{ background: "#111", color: "gold" }}
                  >
                    SUCCESS
                  </option>
                  <option
                    value="FAILED"
                    style={{ background: "#111", color: "gold" }}
                  >
                    FAILED
                  </option>
                </select>
              </div>

              {/* Submit */}
              <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                <GoldButton
                  type="submit"
                  disabled={submitting}
                  data-ocid="payment-history.submit_button"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {submitting ? "Recording..." : "Record Payment"}
                </GoldButton>

                <AnimatePresence>
                  {feedback && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs font-semibold"
                      data-ocid={
                        feedback.type === "success"
                          ? "payment-history.success_state"
                          : "payment-history.error_state"
                      }
                      style={{
                        color:
                          feedback.type === "success"
                            ? "oklch(0.75 0.14 148)"
                            : "oklch(0.72 0.18 25)",
                      }}
                    >
                      {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function PaymentHistorySection() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, login, isInitializing } = useInternetIdentity();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "SUCCESS" | "FAILED"
  >("ALL");
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isLoggedIn = !!identity;

  const fetchData = useCallback(async () => {
    if (!actor || actorFetching) return;
    setLoading(true);
    setFetchError(null);
    try {
      const [history, adminCheck] = await Promise.all([
        actor.getPaymentHistory(),
        actor.isCallerAdmin(),
      ]);
      setPayments(history);
      setIsAdmin(adminCheck);
    } catch {
      setFetchError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor, actorFetching]);

  useEffect(() => {
    if (isLoggedIn && actor && !actorFetching) {
      fetchData();
    }
  }, [isLoggedIn, actor, actorFetching, fetchData]);

  // ── Filtered & searched list ──────────────────────────────────────────────
  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.customerName.toLowerCase().includes(q) ||
      p.transactionId.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      id="payment-history"
      data-ocid="payment-history.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard
                className="w-6 h-6"
                style={{ color: "oklch(var(--gold))" }}
              />
              <h2
                className="text-3xl md:text-4xl font-bold font-display"
                style={{ color: "oklch(var(--gold))" }}
              >
                Payment History
              </h2>
            </div>
            <div
              className="h-0.5 w-16 rounded-full"
              style={{ background: "oklch(var(--gold))" }}
            />
          </div>

          {/* Auth guard */}
          {isInitializing ? (
            <div
              className="flex items-center gap-3 py-12"
              data-ocid="payment-history.loading_state"
            >
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: "oklch(var(--gold))" }}
              />
              <span style={{ color: "oklch(var(--gold-muted))" }}>
                Initializing...
              </span>
            </div>
          ) : !isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6 py-16 rounded-2xl"
              data-ocid="payment-history.card"
              style={{
                border: "1px dashed oklch(var(--gold) / 30%)",
                background: "oklch(var(--gold) / 3%)",
              }}
            >
              <ShieldCheck
                className="w-14 h-14 opacity-40"
                style={{ color: "oklch(var(--gold))" }}
              />
              <div className="text-center">
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ color: "oklch(var(--gold))" }}
                >
                  Login Required
                </p>
                <p
                  className="text-sm max-w-xs text-center"
                  style={{ color: "oklch(var(--gold-muted))" }}
                >
                  Payment history is admin-protected. Please sign in to view
                  verified transaction records.
                </p>
              </div>
              <GoldButton
                onClick={login}
                data-ocid="payment-history.primary_button"
              >
                Sign In to View History
              </GoldButton>
            </motion.div>
          ) : (
            <>
              {/* Admin panel */}
              {isAdmin && <AddPaymentForm onAdded={fetchData} />}

              {/* Filter + Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
                {/* Status filter tabs */}
                <div
                  className="flex rounded-lg overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid oklch(var(--gold) / 25%)" }}
                >
                  {(["ALL", "SUCCESS", "FAILED"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f)}
                      data-ocid={`payment-history.${f.toLowerCase()}.tab`}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                      style={{
                        background:
                          statusFilter === f
                            ? "oklch(var(--gold))"
                            : "transparent",
                        color:
                          statusFilter === f ? "#0B0B0B" : "oklch(var(--gold))",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative flex-1 min-w-0 max-w-sm">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or transaction ID..."
                    data-ocid="payment-history.search_input"
                    style={{
                      background: "#000",
                      border: "1px solid oklch(var(--gold) / 35%)",
                      color: "oklch(var(--gold))",
                      borderRadius: "8px",
                      padding: "8px 12px 8px 32px",
                      fontSize: "13px",
                      outline: "none",
                      width: "100%",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "oklch(var(--gold))";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "oklch(var(--gold) / 35%)";
                    }}
                  />
                </div>

                {/* Refresh button */}
                <GoldButton
                  variant="ghost"
                  onClick={fetchData}
                  disabled={loading}
                  data-ocid="payment-history.secondary_button"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </GoldButton>
              </div>

              {/* Error state */}
              {fetchError && (
                <div
                  className="rounded-lg px-5 py-4 mb-6 text-sm"
                  data-ocid="payment-history.error_state"
                  style={{
                    background: "oklch(0.5 0.2 25 / 8%)",
                    border: "1px solid oklch(0.5 0.2 25 / 30%)",
                    color: "oklch(0.72 0.18 25)",
                  }}
                >
                  {fetchError}
                </div>
              )}

              {/* Table / skeleton / empty state */}
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <div
                  data-ocid="payment-history.empty_state"
                  className="flex flex-col items-center justify-center gap-4 rounded-2xl py-16"
                  style={{
                    border: "1px dashed oklch(var(--gold) / 20%)",
                    background: "oklch(var(--gold) / 2%)",
                  }}
                >
                  <CreditCard
                    className="w-12 h-12 opacity-20"
                    style={{ color: "oklch(var(--gold))" }}
                  />
                  <p
                    className="text-sm text-center"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  >
                    {payments.length === 0
                      ? "No payment records yet. Verified payments will appear here."
                      : "No transactions match your current filter."}
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: "1px solid oklch(var(--gold) / 20%)",
                  }}
                  data-ocid="payment-history.table"
                >
                  {/* Table header */}
                  <div
                    className="grid px-5 py-3 text-xs uppercase tracking-widest font-bold"
                    style={{
                      background: "oklch(var(--gold) / 8%)",
                      color: "oklch(var(--gold-muted))",
                      gridTemplateColumns:
                        "minmax(0,2fr) minmax(0,1.5fr) 90px 90px minmax(0,1.5fr)",
                      gap: "12px",
                      borderBottom: "1px solid oklch(var(--gold) / 15%)",
                    }}
                  >
                    <span>Transaction ID</span>
                    <span>Customer Name</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Date &amp; Time</span>
                  </div>

                  {/* Table body */}
                  <div>
                    {filtered.map((record, idx) => (
                      <motion.div
                        key={String(record.id)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.25 }}
                        data-ocid={`payment-history.row.${idx + 1}`}
                        className="grid px-5 py-3.5 items-center transition-colors duration-150"
                        style={{
                          gridTemplateColumns:
                            "minmax(0,2fr) minmax(0,1.5fr) 90px 90px minmax(0,1.5fr)",
                          gap: "12px",
                          background: idx % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                          borderBottom:
                            idx < filtered.length - 1
                              ? "1px solid oklch(var(--gold) / 10%)"
                              : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "oklch(var(--gold) / 5%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            idx % 2 === 0 ? "#0d0d0d" : "#0a0a0a";
                        }}
                      >
                        {/* Transaction ID with tooltip */}
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="truncate text-sm font-mono cursor-default"
                                style={{ color: "oklch(var(--gold) / 70%)" }}
                              >
                                {record.transactionId}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              style={{
                                background: "#111",
                                border: "1px solid oklch(var(--gold) / 30%)",
                                color: "oklch(var(--gold))",
                                fontSize: "12px",
                              }}
                            >
                              {record.transactionId}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Customer Name */}
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: "oklch(var(--gold))" }}
                        >
                          {record.customerName}
                        </span>

                        {/* Amount */}
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "oklch(var(--gold))" }}
                        >
                          ₹{record.amount.toLocaleString("en-IN")}
                        </span>

                        {/* Status badge */}
                        <span>
                          <StatusBadge status={record.status} />
                        </span>

                        {/* Date */}
                        <span
                          className="text-xs"
                          style={{ color: "oklch(var(--gold-muted))" }}
                        >
                          {nsToDate(record.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer summary */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{
                      borderTop: "1px solid oklch(var(--gold) / 15%)",
                      background: "oklch(var(--gold) / 4%)",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "oklch(var(--gold-muted))" }}
                    >
                      Showing {filtered.length} of {payments.length} transaction
                      {payments.length !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(var(--gold) / 60%)" }}
                    >
                      Verified records only
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
