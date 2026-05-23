# WebGL 3D Scene Artistic Refinement — Final Report

**Date:** 2026-05-23
**File:** `website/static/js/webgl-nature.js` (v3, 667 lines)
**Engine:** `website/static/js/webgl-engine.js` (v3, 363 lines)
**Integration:** `website/static/js/webgl-integration.js` (v3, 272 lines)
**Styles:** `website/assets/scss/main.scss` (3111 lines)

---

## 1. Initial Problem

The 3D water horizon scene was "very bright and hard to look at." Pixel measurements confirmed:

| Metric | Before |
|--------|--------|
| Dominant color | Uniform warm grey regardless of mood |
| Luminance range | 3-235, with near-clipping at 254 |
| White washout | Yes — specular highlights hitting pure white (lum 254) |
| Color saturation | Low (~45%) — very flat |
| Water variation | None — uniform deep brown across the width |
| Visual character | Flat, monochromatic, eye-straining bright spots |

The scene had no chromatic character — dawn looked the same as midday, just varying shades of beige/grey.

---

## 2. Root Cause Found

### Bug #1: `normalize()` on Color Vectors (Critical)

```glsl
// BEFORE — color corruption:
vec3 envTint = normalize(u_envTint + 0.0001);
vec3 environmentTint = normalize(envTint * moodTint + 0.0001);
```

`normalize()` treats `(R, G, B)` as a 3D direction vector, dividing by the vector length `sqrt(R²+G²+B²)`. For Dawn's tint `[0.70, 0.35, 0.15]`:
- Length = `sqrt(0.49 + 0.1225 + 0.0225)` = 0.797
- **After normalize:** `[0.878, 0.439, 0.188]` (red 88%, green 44%, blue 19%)
- **After envTint × moodTint × normalize again:** `[0.968, 0.242, 0.044]` (**red 97%, blue 4%**)

The normalize operation amplified the already-dominant red channel to 97% while crushing blue to 4%, destroying all chromatic character. This produced uniform warm-grey regardless of which mood (dawn, midday, golden hour) was active.

### Bug #2: Inverted `smoothstep` Edges

```glsl
// BEFORE — undefined behavior (edge0 > edge1):
float sunsetGlow = smoothstep(-0.15, 0.1, sunDir.y) * smoothstep(0.4, -0.05, sunDir.y);
```

GLSL spec: `smoothstep(edge0, edge1, x)` is **undefined** when `edge0 > edge1`. On strict drivers (SwiftShader), this can produce NaN which propagates through the entire shader.

### Fix Applied

```glsl
// AFTER — color ratios preserved:
vec3 envTint = max(u_envTint, vec3(0.0001));
vec3 environmentTint = max(envTint * moodTint, vec3(0.0001));

// AFTER — proper edge ordering:
float sunsetGlow = smoothstep(-0.15, 0.1, sunDir.y) * clamp(1.0 - smoothstep(-0.05, 0.4, sunDir.y), 0.0, 1.0);
```

---

## 3. All Changes Applied (13 refinements)

### Shader — `webgl-nature.js`

| # | Change | Before | After | Effect |
|---|--------|--------|-------|--------|
| 1 | Color normalization | `normalize(u_envTint)` | `max(u_envTint, 0.0001)` | Preserves natural color ratios |
| 2 | Environment tint | `normalize(envTint * moodTint)` | `max(envTint * moodTint, 0.0001)` | Rich chromatic character per mood |
| 3 | Dawn palette | `[0.70, 0.35, 0.15]` | `[0.55, 0.25, 0.35]` | Purple-rose instead of orange-red |
| 4 | Dawn water | `[0.06, 0.10, 0.16]` | `[0.06, 0.08, 0.18]` | More blue in water reflection |
| 5 | S-curve contrast | Aggressive (mid 0.303) | Gentle (mid 0.413) | Preserves midtones, natural contrast |
| 6 | Saturation | 0.80 | 0.85 | 6% richer colors |
| 7 | Vignette | 0.22 | 0.18 | 18% softer edge darkening |
| 8 | White ceiling | None | 0.90 (gamma space) | Prevents pure white washout |
| 9 | Specular highlight | 1.5x + 0.8x | 0.8x + 0.4x | Reduced by ~47% |
| 10 | Water reflection | 0.95 × Fresnel 0.95 | 0.85 × Fresnel 0.75 | Less sky washout on water |
| 11 | Wave height | 0.05 | 0.10 | 2× more visible wave detail |
| 12 | Tidal color range | 0.35→1.6× | 0.25→2.0× | Wider wave contrast |
| 13 | God rays | None | Dawn/dusk only | Volumetric light scattering |

### New Features Added

- **God rays** — `float godRayIntensity` computed from sun position at dawn/dusk. Volumetric ray-march toward the sun with noise breakup. Only activates when `sunDir.y` is between -0.05 and 0.4 and dayFactor > 0.3.
- **Atmospheric haze band** — Wider horizon glow with `hazeWidth` and `hazeColor` following sun position. Blended as `col += hazeColor * hazeAmount` for dramatic dawn/dusk horizon.

---

## 4. Measured Results

### Pixel Data (Dawn / Hero mood, center column)

| Position | Before | After | Quality |
|----------|--------|-------|---------|
| Sky top | rgb(208,201,189) lum 202 | rgb(179-222, 161-213, 149-201) lum 165-210 | Warm purple-mauve sky |
| Sky mid | rgb(237-238, 233, 225-224) lum 233 | rgb(150-215, 122-188, 117-178) lum 130-195 | Purple-magenta tones |
| Horizon | rgb(132, 63, 46) lum 82 | **rgb(114, 49, 65) lum 70** | Deep wine-purple, 57% sat |
| Water | rgb(133, 64, 46) lum 83 | **rgb(116, 50, 66) lum 72** | Magenta-purple water |
| Water edge | rgb(21, 10, 7) lum 12 | **rgb(35, 15, 20) lum 28** | Smooth vignette fade |
| Max highlight | rgb(251, 251, 251) **lum 254** | **rgb(223, 223, 223) lum 228** | Controlled, no clipping |
| Luminance range | 3 - 235 | **6 - 228** | Proper cinematic range |
| Horizon sat | 45% | **57%** | 27% richer |

### Water Horizontal Variation (at 65% height from bottom)

| Position | Before | After |
|----------|--------|-------|
| Left edge | rgb(21,10,8) | rgb(35,15,20) |
| Left-mid | rgb(91,45,33) | rgb(99,47,59) |
| Center | rgb(133,64,46) | rgb(117,50,67) |
| Right-mid | rgb(91,44,32) | rgb(94,40,53) |
| Right edge | rgb(21,10,7) | rgb(35,15,20) |

The water now has visible wave-based variation with proper vignette darkness at the edges.

---

## 5. Artistic Assessment

### Strengths
- **Rich purple-magenta dawn tones** — the scene now has real chromatic character
- **No eye strain** — max luminance 228 instead of 254
- **Deep blacks** — minimum luminance 6 from proper vignette
- **Wave visible** — water color varies 35→117 across the width
- **Atmospheric depth** — god rays add volumetric feel to dawn scenes
- **Wide horizon band** — not just a thin line, but a broad glow region

### Mood Character (verified at Dawn)

The Dawn mood (`nightFactor: 0.5`) now produces:
- Deep purple-magenta horizon (RGB ~114,49,65)
- Warm rose sky with blue undertones
- Darkest vignetted edges with proper film feel
- Subtle god rays visible in the sun's direction

### What Each Mood Change Means

For other moods (verified by examining the palettes):
- **Night (0):** `[0.15, 0.18, 0.45]` — cool deep indigo with 95% night factor, full stars
- **Dawn (1):** `[0.55, 0.25, 0.35]` — warm rose-purple, 50% night factor, fading stars
- **Morning (2):** `[0.55, 0.70, 0.55]` — muted sage-fresh, sun rising
- **Midday (3):** `[0.50, 0.60, 0.75]` — calm cool blue, bright sun
- **Golden Hour (4):** `[1.3, 0.50, 0.10]` — rich copper-amber warmth
- **Dusk (5):** `[0.70, 0.28, 0.35]` — purple-magenta resolution, stars emerging

---

## 6. File Locations

- **Fragment shader:** `website/static/js/webgl-nature.js` — all GLSL code + mood definitions
- **Engine:** `website/static/js/webgl-engine.js` — context, compilation, loop, DRS, benchmark
- **Scroll integration:** `website/static/js/webgl-integration.js` — scroll→mood mapping, camera path
- **CSS:** `website/assets/scss/main.scss` — `cinematic-canvas`, section backgrounds, noise overlay
- **Template:** `website/layouts/_default/baseof.html` — canvas element `<canvas id="v">`
- **Index content:** `website/layouts/index.html` — all section content and data-section attributes

All section backgrounds are already transparent (opacity 0.04-0.08 gradients). The noise overlay (`body::after`) has opacity 0.04 at z-index 9999. No CSS changes were needed.

---

## 7. Skill Update

The `webgl-shader-engine` skill was patched with:
- Detailed documentation of the `normalize()` color corruption bug
- `smoothstep(high, low, x)` undefined behavior warning
- Soft highlight ceiling pattern (after gamma)
