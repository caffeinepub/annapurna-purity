# Annapurna Purity

## Current State
The app is a full-featured premium bottle manufacturer website with:
- Fixed black/gold header with logo and nav (Home, About, Contact, Order, Profile)
- HomeSection: glowing logo card, 3D React Three Fiber glass bottle with animated water fill and floating droplets, glassmorphism CTA card
- AboutSection, ContactSection, OrderSection (WhatsApp integration), ProfileSection (localStorage)
- Dark theme with OKLCH gold color tokens, Framer Motion animations

## Requested Changes (Diff)

### Add
- **IntroAnimation component**: Full-screen overlay that plays a 5-second AI-powered animation when the user first visits, then fades out and reveals the main website.
  - Scene 1 (0–1s): Glowing digital bottle fades in with floating AI particles (cyan/green dots orbiting)
  - Scene 2 (1–2s): Neural network lines and horizontal scanning light pass through the bottle
  - Scene 3 (2–3.5s): Bottle begins morphing — morphs shape, opacity flickers, organic wobble starts
  - Scene 4 (3.5–4.2s): Green plant shape emerges from bottle center with glowing energy pulses
  - Scene 5 (4.2–4.7s): Plant stabilizes, emits soft green glow, particles settle
  - Scene 6 (4.7–5s): Logo (logo.png) fades in with scale-up zoom + glow; text "Welcome to the Future of Sustainability" + "Powered by AI" fade in
  - CTA button "Tap to Enter" appears at 4.8s with pulse animation — clicking it dismisses the intro
  - Auto-dismisses at 5s with a smooth full-screen fade-out
  - Background: dark gradient (#050a0f → #0a1a0a) with animated neural network grid lines and glowing particles
  - Colors: neon green (#00ff88), cyan (#00d4ff), white, dark background
  - Fully responsive
  - Uses CSS animations + React state for timing (no external animation library dependencies beyond already-installed framer-motion)

### Modify
- **App.tsx**: Conditionally render `<IntroAnimation>` overlay before the main site. Once dismissed (auto or click), show the main site. Use localStorage to not show again on repeat visits (optional: skip if sessionStorage preferred for always-showing).

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/IntroAnimation.tsx` — the full overlay component with all 6 scenes driven by CSS keyframes and React `useEffect` timers
2. Implement Canvas-based or pure CSS neural network background (animated SVG lines or CSS pseudo-elements)
3. Build bottle-to-plant morph using SVG path morphing or layered CSS shapes with opacity/scale transitions
4. Add logo reveal, text overlays, and CTA button with timing
5. Wire IntroAnimation into App.tsx with useState for `introShown`
6. Validate (lint + typecheck + build)
