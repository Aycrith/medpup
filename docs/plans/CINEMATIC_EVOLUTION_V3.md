# MedPup Cinematic Evolution Plan — V3

## Vision
Transform the MedPup landing page into a scroll-driven cinematic experience with a continuous evolving visual environment. Each section is a "chapter" in a story, with the background atmosphere evolving to match the narrative arc. Target: the artistic depth and polish of rahatil.co, applied to a veterinary concierge brand.

---

## Core Concept: The "All-In Journey"

The user scrolls through a single continuous visual environment that evolves from **dark uncertainty** (section 1: the problem) → **discovery** (section 2: how it works) → **transparency** (section 3: the calculator) → **trust** (section 4: clinics & comparison) → **action** (section 5: CTA). Each phase has a distinct background treatment that smoothly transitions into the next.

**Visual arc:** Deep navy/abyss (#030a14) → teal emergence (#0a2838) → golden clarity (#1a1810) → bright teal resolution (#0d2830) → warm action (#1a1420)

---

## Phase 1: Continuous Background Environment (HIGHEST PRIORITY)

### 1A — Three.js Particle System (or lightweight alternative)

Create a canvas-based particle field that covers the full viewport behind all content. This is the "background world" the user moves through.

**Implementation:**
- ~200 particles with varying size, opacity, and drift speed
- Particles change color, density, and motion behavior per section
- Three "layers" of particles: deep (slow, large), mid (medium), surface (fast, small)
- Each section triggers a smooth color and behavior transition over 2-3s

**Section-specific particle states:**

| Section | Particles | Colors | Motion | Density |
|---------|-----------|--------|--------|---------|
| Hero (Problem) | Slow, heavy | Dark blue, deep navy | Sinking/drifting down | Sparse |
| Intro (Discovery) | Rising | Teal, cyan emerging | Rising up | Medium |
| Steps (Process) | Orbiting | Gold, warm white | Circular orbits | Medium |
| Calculator (Transparency) | Sharp, focused | Bright cyan | Gathering toward center | Dense |
| Clinics (Network) | Connecting lines | Teal, green | Lines between particles | Network pattern |
| Trust/CTA (Resolution) | Celebratory | Gold, warm white | Expanding outward | Full |

**Alternative (if Three.js is too heavy):** CSS-only approach using layered `@keyframes` animations on pseudo-elements with `mix-blend-mode`. Can achieve 80% of the effect with zero JS overhead.

### 1B — Per-Section Ambient Gradient

Each section has a large background gradient that subtly transitions:
```
.section-hero {
    background: radial-gradient(ellipse at 30% 40%, rgba(91,192,235,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 30%, rgba(139,105,20,0.03) 0%, transparent 50%);
}
```

These shift per section using CSS custom properties, creating a living color environment.

### 1C — Scroll Progress Bar

A thin horizontal bar at the very top (or bottom) of the viewport indicating scroll progress. Renders as a subtle glowing line that fills from left to right.

---

## Phase 2: Cinematic Hero Transformation

Replace the current gradient mesh with a deeply layered hero:

### 2A — Hero Layers (z-indexed)
```
z-index 0: Full-screen canvas particle system (the "world")
z-index 1: Large atmospheric light beams (CSS pseudo-elements with skew + gradient)
z-index 2: Subtle noise texture overlay (SVG filter applied as background)
z-index 3: Hero gradient vignette (darkens edges, focuses center)
z-index 4: Content (typography, buttons, stats)
```

### 2B — Hero Typography Treatment
- Main headline: Cinzel, larger sizing (`clamp(3rem, 6vw, 6rem)`)
- Each word or phrase fades in sequentially (staggered animation)
- "Your dog deserves" fades → pause → "the best care" slides in with gold accent
- Subtitle has a subtle typewriter or reveal effect
- Badge ("Pinellas County Veterinary Concierge") sits on a glass-morphism backdrop

### 2C — Hero Stats with Count-Up Animation
- The three stats (80-95%, $25-$100, 100%) animate counting up on first scroll
- Accompanied by a subtle pulse effect when they reach final value

---

## Phase 3: Scroll-Driven Storytelling

### 3A — Section Narrative Arc (Content Restructuring)

Each section gets a "chapter" treatment:

**Chapter 1 — "The Problem" (Hero + Intro):**
- Background: Dark, heavy, isolating
- Typography: Pain point emphasis — "Your dog deserves the best care. It shouldn't require a second mortgage."
- Visual: The particle field is sparse, particles drift downward like falling
- Transition to next: Particles begin to rise, color shifts to teal

**Chapter 2 — "The Solution" (How It Works):**
- Background: Teal emergence, lighter
- Each step card reveals with a stagger
- Visual: Particles orbit around step numbers
- Micro-copy: "Three simple steps to peace of mind"

**Chapter 3 — "The Proof" (Calculator + Comparison Table):**
- Background: Golden clarity, warm
- Calculator fades in from below
- Table rows highlight on scroll with sequential reveal
- Savings badge pulses

**Chapter 4 — "The Network" (Clinics):**
- Background: Bright teal, connected
- Map fades in with markers animating sequentially
- Clinic cards slide in from alternating sides
- Particle network lines form between clinic locations

**Chapter 5 — "The Action" (Trust + CTA):**
- Background: Warm gold resolution
- Trust cards reveal with 3D perspective tilt
- CTA button has a breath/pulse animation
- Final particles expand outward (release)

### 3B — Section Transition Effects

Between each chapter, a subtle "page turn" effect:
- Option 1: A horizontal gradient sweep passes through the viewport
- Option 2: The section background does a 2-second crossfade while particles restructure
- Option 3: A geometric shape (circle/triangle) radially reveals the new section

Implementation: Use `IntersectionObserver` with rootMargin to trigger transitions when the section is ~60% visible, with CSS transitions on background-color, particle config, and element transforms.

---

## Phase 4: 3D & Interactive Elements

### 4A — Parallax Depth Layers

Each section has 3-4 visual layers at different z-depths that move at different speeds on scroll:

| Layer | Z-offset (parallax) | Content |
|-------|-------------------|---------|
| Far background | 0.2x scroll speed | Particle system, giant subtle geometric shapes |
| Mid background | 0.5x scroll speed | Section gradient orbs, light beams |
| Near foreground | 0.8x scroll speed | Decorative shapes, floating badges |
| Content | 1x scroll speed | Text, cards, buttons |

### 4B — Mouse-Follow Parallax

On the hero and key cards, a subtle mouse-follow transform:
- Hero title shifts 1-2px in opposite direction of cursor
- Step/trust cards tilt 2-3deg toward cursor on hover
- Calculator cards have a 1px shadow shift

Implementation: `mousemove` event with `requestAnimationFrame` throttling. `transform: perspective(800px) rotateX(angle) rotateY(angle)`.

### 4C — 3D Card Hover States

Step cards, trust cards, and clinic cards get a true 3D hover:
- Card face lifts with `translateZ(20px)` on hover
- Inner elements (icon, text) have their own z-offset for depth
- Shadow deepens and shifts
- Border highlight sweeps across on entrance

### 4D — Signature Interactive Element

Replace the static calculator with a more engaging visual:

**Option A: "Savings Meter"**
A large semi-circular gauge that fills as the user selects different procedures. The needle sweeps from "Typical Vet Cost" to "MedPup Cost" showing the gap visually.

**Option B: "Cost Spectrum"**
A horizontal spectrum bar with two markers: "Typical US Cost" (red end) and "MedPup Cost" (green end). Selecting a procedure animates both markers to their positions, with the savings gap highlighted in gold.

**Option C: "Before/After Slider"**
A comparison slider where dragging left shows the published price, right shows the real out-the-door cost — revealing hidden fees dramatically.

---

## Phase 5: Micro-Interactions & Animation Polish

### 5A — Hover State Library

Every interactive element gets a deliberate hover state:

| Element | Normal | Hover | Transition |
|---------|--------|-------|------------|
| Nav links | Text secondary | Text accent + indicator | 200ms ease |
| Primary button | Gradient fill | Lift 2px + glow intensify | 300ms cubic-bezier |
| Secondary button | Border only | Fill with accent (10% opacity) + border accent | 250ms |
| Step cards | Flat with border | Lift 6px + shadow XL + border accent | 400ms ease |
| Clinic cards | Flat with border | Lift 4px + slight scale(1.02) | 350ms |
| FAQ items | Flat | Subtle background shift | 200ms |
| Theme toggle | Icon only | Subtle rotate on switch | 500ms bounce |

### 5B — Entrance Animations (Per Section)

| Section | Element | Animation | Stagger | Duration |
|---------|---------|-----------|---------|----------|
| Hero | Headline | Words fade-up sequentially | 200ms | 800ms |
| Hero | Subtitle | Fade-up after headline | — | 600ms |
| Hero | Stats | Count-up on scroll | 300ms | 1000ms |
| Steps | Cards | Fade-up from bottom | 150ms | 700ms |
| Calculator | Results | Sequential reveal (US→clinic→fee→total) | 200ms | 400ms each |
| Clinics | Map | Fade-in with zoom effect | — | 1000ms |
| Clinics | Cards | Slide in alternating sides | 200ms | 600ms |
| Trust | Cards | 3D tilt reveal | 150ms | 700ms |
| FAQ | Accordion | Smooth expand | — | 400ms cubic-bezier |
| CTA | Button | Pulse/grow on view | — | 600ms |

### 5C — Loading States

- Initial page load: Show a minimal preloader (MedPup logo + thin progress bar)
- Calculator data: Show skeleton cards while JS loads
- Map tiles: Show a loading placeholder with teal pulse until Leaflet initializes

### 5D — Focus & Active States

- Focus-visible: Double-outline ring (inner + outer) with gap
- Active/tap: Scale(0.97) with faster shadow
- Disabled: Reduced opacity, no events, subtle pattern overlay

---

## Phase 6: Typography & Spacing Refinement

### 6A — Optical Sizing

Use `font-optical-sizing: auto` on all fonts. For headings, prefer larger sizes with tighter letter-spacing. For body, wider tracking at small sizes:

```css
h1 { font-size: clamp(3rem, 6vw, 6rem); letter-spacing: -0.02em; }
h2 { font-size: clamp(2rem, 4vw, 3.5rem); letter-spacing: -0.01em; }
.hero-subtitle { font-size: clamp(1rem, 1.5vw, 1.25rem); letter-spacing: 0.05em; }
.page-content { font-size: clamp(0.95rem, 1.2vw, 1.05rem); line-height: 1.75; }
```

### 6B — Section Spacing Rhythm

Introduce deliberate whitespace asymmetry:
- Section padding-top: `clamp(6rem, 10vw, 12rem)`
- Section padding-bottom: `clamp(4rem, 8vw, 10rem)` (slightly less — creates forward momentum)
- First section after hero: reduced top padding (feels connected)
- Last section before CTA: increased bottom padding (builds anticipation)

### 6C — Section Label Refinement

The `.section-label` badges become more distinctive:
- Fixed position on the left edge of each section (vertical text, rotated -90deg)
- "01" numbering for each section
- Thin vertical line extending from the label

---

## Phase 7: Decorative Elements & Visual Atmosphere

### 7A — Light Leaks & Vignettes

Each section gets a subtle light leak effect:
- Random positioned radial gradient near the top or corner
- `mix-blend-mode: screen` or `overlay`
- Opacity 0.03-0.08 — barely perceptible but adds depth

### 7B — Geometric Accents

- Hero: Large subtle geometric shapes (circles, intersecting lines) in the background
- Steps: Connecting line between step numbers (SVG path drawn on scroll)
- Trust: Small decorative dots/particles around card edges
- CTA: A large, faint ring behind the button

### 7C — Noise Texture Overlay

A subtle grain texture over the entire page:
```css
body::after {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 9999;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,...");
    mix-blend-mode: overlay;
}
```

---

## Phase 8: Color System Evolution

### 8A — Per-Section Color Themes

Each section redefines a subset of CSS custom properties:

```css
.section-hero { --section-accent: #5bc0eb; --section-glow: rgba(91,192,235,0.3); }
.section-steps { --section-accent: #8B6914; --section-glow: rgba(139,105,20,0.3); }
.section-calculator { --section-accent: #22c55e; --section-glow: rgba(34,197,94,0.3); }
.section-clinics { --section-accent: #5bc0eb; --section-glow: rgba(91,192,235,0.3); }
.section-trust { --section-accent: #8B6914; --section-glow: rgba(139,105,20,0.3); }
.section-cta { --section-accent: #5bc0eb; --section-glow: rgba(91,192,235,0.3); }
.hero-badge, .section-label, .btn-primary {
    color/background: var(--section-accent);
}
```

This makes the accent color shift as the user scrolls through different chapters.

### 8B — Smooth Theme Transitions

Both dark→light theme toggling and section accent changes use `transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1)` on the root, ensuring no jarring color jumps.

---

## Phase 9: Implementation Details

### 9A — New Files Required

```
website/assets/
├── js/
│   ├── particles.js          # Lightweight canvas particle system
│   ├── parallax.js            # Scroll + mouse parallax
│   ├── scroll-triggers.js     # Section-based animation triggers
│   └── 3d-cards.js            # Card tilt on hover
├── scss/
│   └── main.scss              # Major expansion (+1000 lines)
├── images/
│   └── noise.png              # Grain texture overlay
└── effects/
    └── light-leaks.svg        # Decorative light leak overlay
```

### 9B — Dependencies

- **Three.js (optional):** For the particle system. Consider `particles.js` as a lighter alternative, or a custom Canvas 2D approach (~5KB gzipped vs Three.js ~50KB).
- **Custom code:** Everything else is pure CSS + vanilla JS.

### 9C — Build Safety

- All new JS uses `defer` or late-loading to avoid blocking render
- Canvas particle system degrades gracefully (no crash if WebGL unavailable)
- Parallax is disabled on mobile (via `matchMedia`)
- Reduced motion media query respected throughout
- No external API keys required

---

## Phase 10: Verification & Polish

| Check | Method |
|-------|--------|
| Particle FPS | Monitor `requestAnimationFrame` delta — target 60fps |
| Parallax jank | Check scroll handler is throttled via RAF |
| Mobile touch | Disable mouse-follow parallax on touch devices |
| Reduced motion | All animation durations 0.01ms with `prefers-reduced-motion` |
| Console errors | Zero JS errors or unhandled promise rejections |
| CSS paint cost | Profile with Chrome DevTools — avoid `will-change` on too many elements |
| Accessibility | All animated content has `aria-hidden` where decorative |
| Build verification | `hugo --minify` succeeds with no warnings |

---

## Estimated Effort

| Phase | Hours | Dependencies |
|-------|-------|-------------|
| 1. Background Environment | 4-5 | New JS (canvas particle system) |
| 2. Cinematic Hero | 2-3 | Phase 1 complete |
| 3. Scroll Storytelling | 3-4 | Phase 1 complete |
| 4. 3D & Interactive | 3-4 | Phase 1-3 complete |
| 5. Micro-interactions | 2-3 | Phases 1-4 complete |
| 6. Typography & Spacing | 1 | — |
| 7. Decorative Elements | 2 | — |
| 8. Color Evolution | 1 | — |
| 9. Implementation | 2 | All above |
| 10. Verification | 1 | Build complete |

**Total: ~21-28 hours of focused work**

---

## Quick Wins (Can Do First)

These are visual upgrades that require no new JS and can be done immediately:

1. **Section color transitions** — Add `--section-accent` custom properties to each section (Phase 8)
2. **Scroll progress bar** — A thin CSS bar that tracks scroll position
3. **Noise texture overlay** — SVG-based grain on the body
4. **Typography scale refinement** — Better `clamp()` values for headings
5. **Section label redesign** — Numbered badges on the left edge
6. **Card hover 3D** — Pure CSS perspective transforms on cards
7. **Per-section gradient shifts** — Different ambient gradients per section

---

## Reference: rahatil.co Techniques to Steal

| Technique | How It Works | Our Adaptation |
|-----------|-------------|----------------|
| Color master panel | Full-page color theming with sliders | Per-section accent evolution |
| VIP bridge overlay | Full-screen gate with parallax | N/A (different use case) |
| Crystalline backgrounds | Subtle gradient + noise layers | CSS gradient mesh + noise overlay |
| Scroll-based color shift | JS changes CSS vars on scroll | IntersectionObserver per section |
| Feature cards with icons | SVG icons + gradient backgrounds | Inline SVG illustrations |
| Portfolio lightbox | Full-screen image viewer with progress | N/A (no portfolio images) |
| Typographic hierarchy | Cinzel for display, Inter for body | Already using this stack |
| Glass-morphism elements | backdrop-filter: blur on cards | Apply to hero badge, stats |
| Smooth scroll anchor | Custom scroll behavior | Already implemented |
