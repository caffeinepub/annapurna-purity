# Annapurna Purity

## Current State
The site has 5 sections: Home (3D bottle, AI intro, glassmorphism), About, Order (WhatsApp integration), Contact, Profile. It is a React 18 + Tailwind + Three.js site with luxury black/gold branding and eco-friendly motifs.

## Requested Changes (Diff)

### Add
- A UPI QR Code Generator section/page accessible from the site
- Form inputs: UPI ID, Account Holder Name, Transaction Note (optional), Amount (optional)
- Real-time UPI payment URI generation: `upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={NOTE}`
- Live QR code rendering using the `qrcode` or `qrcode.react` library (client-side, no external service)
- Download QR button (saves QR as PNG image)
- Display the generated UPI URI string for user reference
- Security tips section
- Validation: UPI ID must be non-empty and contain `@`; Name must be non-empty
- Navigation link "UPI Pay" in the header/nav

### Modify
- Add "UPI Pay" anchor link to the existing fixed header navigation

### Remove
- Nothing removed

## Implementation Plan
1. Install `qrcode.react` (already available or add to package.json) for client-side QR rendering
2. Add a `UPIQRSection` React component with form fields, URI builder, QR display, download button, and security tips
3. Wire up the new section at the bottom of App.tsx with id `upi-pay`
4. Add "UPI Pay" nav link in the header
5. Validate and build
