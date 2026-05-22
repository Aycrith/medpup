# WebGL Cinematic Environment — Gap Analysis

## Reference: rahatil.co Architecture

The rahatil.co experience is built on a **custom WebGL2 shader engine** with this architecture:

### Rendering Pipeline
```
Full-screen canvas (<canvas id="v">)
  → WebGL2 context (high-performance, no antialias)
  → Single GLSL program (vertex + fragment shaders)
  → One draw call (TRIANGLE_STRIP, 0, 4)
  → All scene elements computed on GPU
```

### Shader Uniforms (Scene Control Parameters)

| Uniform | Purpose | Drives |
|---------|---------|--------|
| `u_res` | Canvas resolution | Viewport adaptation |
| `u_time` | Elapsed time | Continuous animation |
| `u_mouse` | Mouse position | Interactivity, warp |
| `u_scroll` | Normalized scroll | Camera position |
| `u_viscousScroll` | Smooth scroll | Buttery camera movement |
| `u_camY` | Camera Y position | Scene height/altitude |
| `u_camPitch` | Camera pitch angle | Scene angle |
| `u_camFov` | Camera field of view | Visual zoom |
| `u_wTime` | Wave time | Water animation clock |
| `u_wColor` | Water color (RGB) | Water tint |
| `u_wEnergy` | Wave energy | Wave intensity |
| `u_wHeight` | Wave height | Wave amplitude |
| `u_sDensity` | Star density | Particle count |
| `u_starR/G/B` | Star color | Particle tint |
| `u_warp` | Warp distortion | Mouse ripple effect |
| `u_moodId` | Mood/theme | Visual atmosphere |
| `u_scenario` | Scenario | Scene arrangement |
| `u_warmup` | Startup fade | Load transition |
| `u_detailFade` | Detail fade | Smooth transitions |
| `u_isMobile` | Mobile flag | Quality reduction |
| `u_drsTier` | Resolution tier | Dynamic resolution scaling |

### Scene Elements (all GPU-computed)
1. **3D camera path** — scroll-driven through a 3D scene
2. **Water/ocean simulation** — wave energy, height, color
3. **Star/particle field** — density, color, distribution
4. **Warp/distortion** — mouse-reactive displacement
5. **Mood-based color grading** — per-section atmosphere
6. **GPU-smooth scroll** — frame-synced scroll interpolation

### Quality Features
- Dynamic Resolution Scaling (DRS) for mobile
- GPU-accelerated smooth scroll (no jank)
- Mobile tier detection + quality lock
- Warmup fade to avoid pop-in
- Fallback for WebGL2-unsupported devices

---

## Current MedPup State vs Target

| Feature | Current Implementation | Target (rahatil.co parity) |
|---------|----------------------|---------------------------|
| **Background rendering** | CSS gradient mesh + Canvas 2D particles | Full-screen WebGL2 shader |
| **Scene complexity** | 200 particles, 3 layers | Unlimited GPU-computed elements |
| **Scroll camera** | CSS section snap + fade | Continuous 3D camera path |
| **Color transitions** | CSS custom properties (1.8s) | GPU uniform lerp (frame-synced) |
| **Water simulation** | None | GPU-based wave simulation |
| **Star field** | None (CSS particle alternative) | GPU star field with uniforms |
| **Mouse interactivity** | CSS card tilts + parallax.js | Shader-level warp/distortion |
| **Section mood system** | CSS class changes per section | GPU uniform `u_moodId` + `u_scenario` |
| **Smooth scroll** | Native browser scroll | GPU-synced viscous scroll |
| **Performance** | CPU-based (Canvas 2D) | GPU-based (WebGL2) |
| **Mobile optimization** | Reduced animations | DRS + quality tiers |
| **Load transition** | Preloader (CSS/JS) | Shader warmup fade |
| **Draw calls per frame** | N/A (CSS rendering) | 1 draw call |

---

## Critical Gap: Why CSS + Canvas 2D Cannot Match WebGL2

1. **No GPU shaders** — All visual effects must be pre-baked in CSS or JS
2. **No 3D scene** — Canvas 2D is flat, cannot do perspective camera
3. **CPU-limited** — 200 particles already consumes resources; rahatil.co renders infinite particles on GPU
4. **No per-pixel control** — Shaders operate on every pixel simultaneously
5. **No continuous scroll scene** — CSS can snap but cannot morph backgrounds continuously

---

## Migration Plan

### Phase 1: WebGL2 Canvas Engine (HIGHEST PRIORITY)
Create a custom WebGL2 rendering engine for the full-viewport background canvas:
- GLSL vertex + fragment shaders
- Full-screen quad rendering
- Uniform management system
- RequestAnimationFrame loop
- Fallback for non-WebGL2 browsers

### Phase 2: 3D Scene Elements
- Star/particle field with density/color uniforms
- Water/wave simulation with energy/height/color
- 3D camera path driven by scroll
- Mouse-reactive warp/distortion

### Phase 3: Scroll-Driven Camera
- GPU-synced smooth scroll interpolation
- Camera path defined by section positions
- Per-section mood/scenario triggers
- Smooth transitions between sections

### Phase 4: Interactive Features
- Mouse position tracking for scene distortion
- GPU-accelerated hover effects on cards
- Performance tier detection (DRS)

### Phase 5: Integration
- Overlay existing HTML content on canvas
- Preserve all current features (calculator, map, FAQ, etc.)
- Graceful fallback for non-WebGL2 browsers
- Mobile optimization
