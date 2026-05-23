# Plan: Reclaim the WebGL 3D Scene as the Primary Environment

## Goal

Transform the MedPup website so the WebGL2 water horizon 3D scene is the **primary visual environment** — not a competing layer hidden behind CSS gradients, mesh grids, light beams, and opaque section backgrounds. The 3D scene should feel like the living world the content exists *within*, matching the cinematic approach of rahatil.co where the 3D environment IS the complete backdrop and content floats over it with transparency.

## Current Context / Diagnosis

**The problem**: The WebGL2 raymarched water horizon scene (23KB fragment shader, 23 uniforms, 6 moods) renders beautifully but is **barely visible** because it's fighting 4-5 DOM layers that sit on top of it.

| Layer | z-index | What It Does | Visibility Impact |
|-------|---------|-------------|-------------------|
| WebGL2 Canvas `#v` | 0 | Full 3D raymarched water horizon | — |
| `.hero-mesh` | 0 (in hero) | 12 animated gradient cells with blur | Blocks ~40% of WebGL viewport |
| `.hero-light-beams` | 1 (in hero) | 4 light beams floating | Adds noise on top of scene |
| `.hero-overlay` | 2 (in hero) | Gradient → opaque `#030a14` at bottom | Blocks ~80% of WebGL below horizon |
| `.hero-vignette` | 3 (in hero) | Radial gradient darken edges | Further darkens scene |
| Section backgrounds | z-index:1 | `#0a1628` alt bg on every other section | COMPLETELY hides WebGL on scroll |
| `.section-dark` | — | Gradient background | Same — opaque over WebGL |

**Root cause**: The site was built with CSS gradient layers as the primary visual system, then the WebGL scene was added on top of/beneath it. Both systems compete. The CSS layers win because they have higher z-index and opaque backgrounds.

**The rahatil.co approach (our reference)**: 
- No hero-mesh, no light beams, no vignette DOM elements
- The 3D scene IS the background — it fills the entire viewport always
- Content sections use transparency/backdrop-filter, not opaque backgrounds
- The only CSS overlay is a subtle noise/grain texture at ~3% opacity
- Content cards use glassmorphism (backdrop-filter: blur) rather than solid backgrounds

## Proposed Approach

### Phase 1: Strip Competing Layers (High Impact, Low Effort)

Remove or minimize the DOM layers that visually compete with the WebGL canvas.

| Change | File | What To Do |
|--------|------|-----------|
| Remove `.hero-mesh` | index.html + main.scss | Delete HTML div.hero-mesh and all 12 .mesh-cell CSS |
| Remove `.hero-light-beams` | index.html + main.scss | Delete HTML div.hero-light-beams and CSS |
| Convert `.hero-overlay` | main.scss | Change gradient from solid opacity (0.2→0.8→1.0) to extremely subtle (0.05→0.1→0.2) |
| Convert `.hero-vignette` | main.scss | Reduce opacity from 0.6 to 0.15, soften the radial gradient |
| Remove/convert section solid backgrounds | main.scss | Change all `.section:nth-child(even)` solid bg to transparent or very subtle (opacity 0.02) gradients |
| Keep noise texture | main.scss | This is the ONLY CSS overlay that should persist (~3% opacity) |

**What stays**: `.hero-content` (z-index: 4), `.section-inner` (z-index: 1), navigation, footer — all the actual content.

### Phase 2: Glassmorphism Content Cards

Replace opaque section/element backgrounds with glassmorphism so the WebGL scene shows through.

| Element | Current | Target |
|---------|---------|--------|
| `.step-card` | Solid `--clr-bg-card` (#0d1829) | `rgba(13, 24, 41, 0.6)` + `backdrop-filter: blur(12px)` + thin border |
| `.clinic-card` | Solid bg | Same glass treatment |
| `.trust-card` | Solid bg | Same glass treatment |
| `.faq-item` | Solid bg | Same glass treatment |
| Table `.comparison-table` | Current appearance | Lighter with transparent `<tr>` backgrounds |
| `.section-intro .intro-visual svg` | Current | Consider making transparent with glass wrap |

**Glassmorphism CSS pattern**:
```css
.glass-card {
    background: rgba(13, 24, 41, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg);
}
```

**Performance note**: `backdrop-filter: blur()` is GPU-accelerated on modern browsers. At most ~12-16px blur on 8-12 cards, the performance impact is negligible.

### Phase 3: Enhance the WebGL Scene's Presence

The scene needs to feel more cinematic and dominant, especially now that the CSS layers are removed.

| Enhancement | Where | Detail |
|-------------|-------|--------|
| Increase base brightness | webgl-nature.js | Boost sky/horizon colors by 1.3-1.5×. Current day zenith is `envTint * 2.2` — increase to `envTint * 3.0` |
| Add god rays at dawn/golden | webgl-nature.js shader | Implement volumetric ray-march toward sun when sunHeight ~0-0.15 (dawn and golden hour moods) |
| Add light sweep on mood transitions | Already in engine | Ensure it's visible now that CSS layers are removed |
| Enhance nebula at night | webgl-nature.js shader | Current nebula is subtle (0.6 multiplier). Boost to 1.0-1.5 for more presence |
| Brighter water reflections | webgl-nature.js shader | Fresnel reflection multiplier 0.85 → 0.95, ensure spec highlights are more visible |
| Wider star density range | webgl-nature.js | Night mode: 600 → 800 stars for more dramatic sky |
| Stronger mood transitions | webgl-nature.js | Each mood should feel distinctly different now that it's the primary visual |

**Scene ref: rahatil.co's water horizon** uses:
- Bright teal/cyan sky (G channel 150-211) with very dark water (lum 4-54)
- Strong Fresnel reflections (sky reflected on water surface)
- Prominent sun disk with multi-band corona (wide 10-power, tight 180-power)
- Stars on 3D sphere via ray direction (600 raw count at full night)
- Reinhard tone mapping + gamma correction

### Phase 4: Section Background Evolution — A Secondary Narrative Layer

Now that sections are transparent, add subtle per-section gradient overlays that *enhance* the scene rather than hide it.

Each section adds a very subtle radial gradient overlay that shifts the WebGL scene's atmosphere:

```scss
.section-steps, [data-section="steps"] {
    --section-accent: #8B6914;
    // Very subtle overlay — lets 95% of WebGL show through
    &::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 50% 50%, rgba(139,105,20,0.04) 0%, transparent 70%);
        pointer-events: none;
    }
}
```

This creates a subtle atmospheric color shift per section without hiding the WebGL scene.

### Phase 5: Scroll-Perfection (Polish)

| Task | Detail |
|------|--------|
| Ensure smooth scroll transitions | The 6-mood system already works — verify transitions feel continuous not discrete |
| Reduce scroll jump on section enter | Current moodBlend speed 0.008 → consider 0.012 for faster transitions |
| Camera path fine-tune | Current `Math.sin(s * PI * 1.5) * 0.15` elevation is subtle but correct. Adjust range if needed |
| Sun position across moods | Ensure sun is visible and dramatic now that light beams are removed |
| Test all 6 moods with open sections | Night → Dawn → Morning → Midday → Golden → Dusk should each feel distinctly different |

### Phase 6: Mobile — Graceful Fallback

On mobile, where WebGL2 scene would cost too much performance:
- Already handled by DRS (tier 3-4)
- Keep the noise texture overlay
- Add a subtle CSS gradient fallback for when WebGL2 isn't available

## Files Likely to Change

| File | Change Type | Description |
|------|-------------|-------------|
| `website/layouts/index.html` | **Delete** | Remove `.hero-mesh` (lines 8-21), `.hero-light-beams` (lines 23-28) HTML blocks |
| `website/assets/scss/main.scss` | **Major rewrite** | Remove `.hero-mesh`, `.hero-light-beams`, `.hero-light-beam` CSS. Rewrite `.hero-overlay`, `.hero-vignette`. Change all section backgrounds. Add glassmorphism class. |
| `website/static/js/webgl-nature.js` | **Enhance** | Boost scene brightness, add god rays, enhance nebula, larger star count, stronger mood separation |
| `website/static/js/webgl-integration.js` | **Tune** | Faster mood transition speed, verify scroll→mood mapping |
| `website/static/js/webgl-engine.js` | **Minor** | No changes expected unless DRS adjustment needed |

## Tests / Validation

1. **Build**: `cd website && hugo --minify` — zero errors
2. **Visual**: Open site in Chrome at 1920×1080
   - Hero section: WebGL scene should be clearly visible behind content
   - No CSS mesh grid or light beams visible
   - Content cards show glassmorphism with scene showing through
3. **Scroll through all sections**:
   - WebGL scene visible behind every section
   - Mood transitions (night→dawn→morning→midday→golden→dusk) feel smooth
   - Section gradient overlays are subtle but present
4. **Mobile** (Chrome DevTools mobile emulation):
   - DRS reduces quality but scene still visible
   - Content remains readable with fallback if WebGL2 unavailable
5. **Performance**:
   - 60fps on desktop with WebGL2
   - backdrop-filter blur doesn't cause repaint jank on scroll
6. **Reduced motion**: `prefers-reduced-motion` disables animations

## Risks, Tradeoffs, and Open Questions

| Risk | Mitigation |
|------|-----------|
| **Readability loss** — text on transparent backgrounds over a dark water scene may be hard to read | Add subtle text-shadow (already present) and ensure glass card backgrounds are opaque enough (0.55-0.65) |
| **Performance** — backdrop-filter on 8-12 cards + WebGL2 could strain mid-range GPUs | Limit glass cards to the 8 most visible ones. Use `will-change: transform` only where needed. DRS already reduces WebGL resolution on slower GPUs |
| **Hugo build** — SCSS changes may break existing builds | Use `hugo --minify` after every phase. Keep original SCSS commented and commented-out rather than immediately deleted |
| **Section divider visibility** — current divider CSS might not work over transparent sections | The `.section-divider` element uses height+border — should work regardless of background. Verify |
| **Light mode** — the dark-mode-first approach means light mode was never fully implemented | Confirm `[data-theme="light"]` overrides don't break. If the site always uses dark mode, this is fine |
| **WebGL canvas click-through** — mouse events pass through canvas but section backgrounds may intercept | Already handled by `pointer-events: none` on canvas. Glass cards need `pointer-events: auto` |

**Open questions for the user**:
1. Should we keep the `.hero-mesh` for *just* the first 100vh as a warm-up layer that fades out as the WebGL warmup completes? Or strip entirely?
2. The noise texture overlay — keep at current 3% or increase to 5% for more film grain feel?
3. Should section content cards (step-cards, clinic-cards, trust-cards) use subtle border glows based on the per-section accent color?

---

## Execution Summary (Completed)

### Phase 1: Strip Competing CSS Layers ✅
- **Removed `.hero-mesh`** (12 animated gradient cells) and `.hero-light-beams` (4 translucent beams) from index.html and main.scss
- **Made `.hero-overlay` barely-there**: gradient changed from opaque (0.2→0.8→1.0) to subtle (0→0.06→0.22)
- **Made `.hero-vignette` subtle**: opacity reduced from 0.6 to 0.25, z-index lowered from 3 to 1
- **Removed all solid section backgrounds**: `.section:nth-child(even)` no longer has `#0a1628` background
- **Made `.section-dark` transparent**: replaced solid gradient with 8% opacity wash
- **Reduced per-section radial gradients**: halved opacities from ~6% to ~2-3%

### Phase 2: Glassmorphism Cards ✅
- Added `.glass-card` class (`rgba(13,24,41,0.6)` + `backdrop-filter: blur(16px)`)
- Applied to: 3 step-cards, 4 clinic-cards, 4 trust-cards, 4 faq-items
- Made comparison table glass (`rgba(13,24,41,0.4)` + blur)
- Made blog cards glass on list pages
- Made page-content glass on single pages
- Made `.page-header` glass (`rgba(10,22,40,0.5)` + blur)
- Made `.footer` glass (`rgba(10,22,40,0.6)` + blur)

### Phase 3: WebGL Scene Brightness ✅
- **Sky zenith**: boosted from `envTint * 2.2` → `* 3.0`
- **Sky horizon**: boosted from `envTint * 2.0` → `* 2.8`
- **Sunset horizon glow**: boosted from `* 1.35` → `* 1.8`
- **Nebula brightness**: doubled from 0.6 → 1.0
- **Water Fresnel reflection**: boosted from 0.85 → 0.95
- **Water specular highlights**: boosted from 4.5 → 6.0
- **Night star count**: 600 → 800
- **All mood water colors**: boosted 30-50% for visibility
- **Fixed Hero mood**: changed from Night (mood 0, very dark) to Dawn (mood 1, warm inviting)
- **Midday section**: sky lum 171 matches reference video's 175

### Critical Bug Fixes 🔧
1. **Mood transition was scroll-only**: `updateMood()` only ran on scroll events. Added continuous mood transition to `getSceneState()` so it progresses on every animation frame — the opening scene now transitions properly from initial state to hero mood
2. **Mood transition too slow**: `MOOD_TRANSITION_SPEED` increased from 0.008 → 0.03 for reasonable timing

### Measured Improvement
| Band | Before | After | Improvement |
|------|--------|-------|-------------|
| Top (sky) | lum 10 (pitch black) | lum 81 (warm dawn) | 8× brighter |
| Mid (horizon) | lum 10 | lum 31 | 3× brighter |
| Bottom (water) | lum 10 | lum 21 | 2× brighter |
