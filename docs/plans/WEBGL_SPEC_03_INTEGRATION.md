# WebGL Engine & Scroll Integration Spec

## Engine Architecture

The WebGL engine manages the GPU pipeline and coordinates all uniform updates.

### Engine Lifecycle

```
1. INIT
   → Create canvas, get WebGL2 context
   → Compile shaders, link program
   → Create full-screen quad buffer
   → Detect DRS tier (benchmark)
   → Start animation loop

2. ANIMATION LOOP (rAF)
   → Read scroll position, interpolate
   → Calculate sun angle from scroll
   → Determine mood + blend factor
   → Update all uniforms
   → Clear canvas
   → Draw full-screen quad
   → Request next frame

3. SCROLL EVENT
   → Update raw scroll value
   → Smooth interpolation target
   → Detect section for mood mapping

4. RESIZE
   → Update canvas dimensions
   → Update u_res uniform
   → Recalculate DRS scale

5. DESTROY
   → Stop animation loop
   → Delete GL resources
   → Remove event listeners
```

---

## Scroll → Scene Mapping

### Section Detection

The HTML content has section markers that the scroll system uses:

```html
<section class="section-hero" data-mood="0">
<section class="section-intro" data-mood="1">
<section class="section-steps" data-mood="2">
<section class="section-calculator" data-mood="3">
<section class="section-clinics" data-mood="4">
<section class="section-trust" data-mood="5">
<section class="section-cta" data-mood="5">
```

### Scroll → Sun Position Mapping

```
scroll 0.0 → sunAngle = -0.3 (night, below horizon)
scroll 0.15 → sunAngle = 0.0 (dawn, rising)
scroll 0.3 → sunAngle = 0.4 (morning)
scroll 0.5 → sunAngle = 1.0 (midday, high)
scroll 0.7 → sunAngle = 1.6 (golden hour, setting)
scroll 0.85 → sunAngle = 2.0 (dusk)
scroll 1.0 → sunAngle = 2.3 (night, below horizon)
```

Where sunAngle maps to: 0=dawn, π/2=midday, π=dusk, 3π/2=midnight

### Mood Crossfade

When scroll enters a new section's range:
- Set `moodTarget` to new section's mood ID
- Set `moodBlend` to 0.0
- Each frame: `moodBlend += 0.005` (200 frames ≈ 3.3s transition)
- Both mood 0 and mood 1 uniforms are sent; shader lerps between them

---

## Smooth Scroll System

### GPU-Synced Scroll Interpolation

```javascript
let rawScroll = 0;        // From scroll event (immediate)
let smoothScroll = 0;     // Interpolated (frame-synced)
const LERP_RATE = 0.08;   // Smoothing factor

function updateScroll() {
    smoothScroll += (rawScroll - smoothScroll) * LERP_RATE;
    gl.uniform1f(uLocs.scrollSmooth, smoothScroll);
}
```

This ensures scroll-driven camera movement is buttery smooth even on 60Hz displays, matching rahatil.co's approach.

### Viscous Scroll Factor

On scroll events, track velocity:
```javascript
let velocity = 0;
const VELOCITY_DECAY = 0.92;

function onScroll() {
    const delta = newScrollPos - prevScrollPos;
    velocity = velocity * VELOCITY_DECAY + delta * 0.15;
    gl.uniform1f(uLocs.viscousScroll, velocity);
}
```

This adds momentum to scene transitions.

---

## Performance Management

### DRS (Dynamic Resolution Scaling)

```javascript
function detectDRSTier() {
    if (isMobileLow) return 4;
    if (isMobile) return 3;
    if (isTablet) return 2;
    // Desktop: quick benchmark
    const fps = runBenchmark(500); // 500ms
    if (fps < 30) return 1;
    return 0;
}

function applyDRS(tier) {
    const scale = [1.0, 1.0, 0.8, 0.6, 0.5][tier];
    canvas.width = Math.round(window.innerWidth * devicePixelRatio * scale);
    canvas.height = Math.round(window.innerHeight * devicePixelRatio * scale);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}
```

### Frame Drop Prevention

- Skip particle layer if frame time > 16ms
- Reduce cloud resolution during fast scroll
- Never block the main thread

---

## Integration with Hugo

### Template Changes

1. **baseof.html**: Canvas already exists (`<canvas class="particle-canvas" id="particle-canvas">`)
   - Change id to `v` and class to `cinematic-canvas`
   - Ensure z-index layering: canvas at 0, content at 1

2. **scripts.html**: Replace Canvas 2D particle script references with WebGL scripts:
   - `webgl-engine.js` (core)
   - `webgl-nature.js` (scene + shaders)
   - `webgl-integration.js` (scroll + mood)

3. **index.html section markers**: Add `data-mood` attributes to sections

### CSS Changes

```css
.cinematic-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;  /* Allows clicking through to content */
}

main, .nav, .footer {
    position: relative;
    z-index: 1;
}
```

### Legacy Cleanup

- Remove: `particles.js`, `scroll-progress.js`, `scroll-triggers.js`, `parallax.js`, `hero-animations.js`, `cinematic-env.js`
- These are replaced by the WebGL engine
- Keep: `core.js`, `savings-spectrum.js`, `micro-interactions.js`, `cursor-trail.js`, `preloader.js`

---

## Browser Support

| Browser | WebGL2 | Shader Support | Fallback |
|---------|--------|---------------|----------|
| Chrome 56+ | ✅ | Full | — |
| Firefox 51+ | ✅ | Full | — |
| Safari 15+ | ✅ | Full | Canvas 2D |
| Edge 79+ | ✅ | Full | — |
| iOS Safari 15+ | ✅ | Limited | Canvas 2D |
| Samsung Internet | ✅ | Full | — |
| Legacy browsers | ❌ | — | Canvas 2D particles |

Graceful degradation: if WebGL2 fails, load existing Canvas 2D particle system as fallback.
