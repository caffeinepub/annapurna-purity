# Annapurna Purity — Payment History Feature

## Current State
The site is a full React SPA (single page, scroll-based) with sections: Home, About, Contact, Order, Profile, UPI Pay. Navigation is a fixed gold/black header with anchor scroll links. There is no sidebar, no authentication, and no backend logic (the Motoko actor is empty). The UPI Pay section generates a QR code locally — no payments are recorded anywhere.

## Requested Changes (Diff)

### Add
- Motoko backend: `Payment` record type with fields: `id` (Nat), `transactionId` (Text), `customerName` (Text), `amount` (Float), `status` (`#SUCCESS` or `#FAILED`), `createdAt` (Int timestamp).
- Backend functions:
  - `recordPayment(transactionId, customerName, amount, status)` — admin-only (caller must match a stored admin principal), validates all required fields, rejects duplicates by transactionId.
  - `getPaymentHistory()` — returns all payments sorted by newest first.
  - `clearAll()` — admin-only, for testing.
- Frontend: A collapsible **sidebar** that slides in from the left, accessible via a menu icon in the header. Contains links to all existing sections PLUS a "Payment History" link.
- Frontend: A **Payment History panel/page** (replaces main content or overlays as a dedicated view) showing:
  - Table with columns: Transaction ID, Customer Name, Amount (₹), Status (badge), Date & Time.
  - Filter bar: filter by status (All / SUCCESS / FAILED), search by name or transaction ID.
  - Empty state if no payments.
  - Admin-only: A button to manually record a test payment (for demo since no real gateway webhook is available).
- Admin access: Only the wallet principal that deployed the canister can add payments and see the "Add Payment" form. All visitors can view payment history (read-only).

### Modify
- Header: Add sidebar toggle button (hamburger/menu icon) alongside the existing nav.
- `Section` type: Add `"payment-history"` as a valid section.
- `NAV_LINKS`: Add `{ id: "payment-history", label: "Payment History" }` entry.

### Remove
- Nothing removed.

## Implementation Plan
1. Define Motoko `Payment` record and stable storage (`HashMap` keyed by transactionId).
2. Implement `recordPayment` with validation: non-empty transactionId, amount > 0, no duplicate transactionId.
3. Implement `getPaymentHistory` returning sorted descending array.
4. Frontend: Add sidebar component that slides in/out over the page using Framer Motion.
5. Frontend: Add `PaymentHistorySection` component that fetches from backend, displays filterable table.
6. Frontend: Wire admin principal check — if `identity.getPrincipal()` matches a known admin principal, show the "Add Payment" form.
7. Validate, build, and deploy.
