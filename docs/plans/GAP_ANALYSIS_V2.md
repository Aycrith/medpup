# Visual Blackout Diagnosis — Root Cause Analysis & Fix Plan

## Discovery Method

Loaded the site at localhost:1314 in a headless Chrome browser, extracted all 22 active uniform values from the WebGL context, and read the rendered pixel output.

## Root Cause #1: Warmup Never Completes (PRIMARY)

**Evidence:** `u_warmup = 0.022` — scene at 2.2% brightness. Average rendered pixel: RGB(0,0,0).

**Engine code:**
```javascript
const fadeFrames = 90;
const warmup = Math.max(0, Math.min(1, (state.frameCount - 30) / fadeFrames));
```

- The benchmark runs for 500ms at 60fps → consumes ~30 frames
- Warmup formula: `(frameCount - 30) / 90` → stays at 0 until frame 30
- On the user's real GPU: frame 30 = ~500ms. Then frames 30-120 = ~1.5s before full brightness
- **BUT** in the browser's test, the benchmark got "2fps" (headless environment)
- At 2fps, reaching frame 30 takes 15 seconds!
- Fix: use **time-based** warmup instead of frame-based

## Root Cause #2: Sun Position Decoupled from Mood

**Evidence:** The scene renders at mood 0 (Night) but the sun is at `sunDir.y ≈ 0.24` (above horizon — daytime).

**Shader code:**
```glsl
float currentSunY = mix(0.15 + u_mouse.y * 1.0, 0.6, solarEase);
vec3 sunDir = normalize(vec3(u_mouse.x, currentSunY, 1.0));
```

- The sun position is 100% mouse-driven, even at Night mood
- The sky renders VERY dark (night colors at mood 0) but the sun thinks it's daytime
- Stars don't render because `trueNight = smoothstep(-0.02, -0.15, sunDir.y) = 0` (sun is up)
- **Result:** Dark sky + no stars + invisible dark water + sun disk barely visible

**Fix:** Add a `u_sunHeight` uniform from the mood system. The mouse adds a subtle offset (±0.1) but the base sun position comes from the mood. At mood 0 (Night), sunHeight = -0.3 so the sun stays below the horizon even with mouse movement.

## Root Cause #3: Scene Luminance Too Low (Night + Dawn)

**Evidence:** At mood 0 (Night), `waterColor = [0.01, 0.04, 0.08]` and `nightZenith = envTint × 0.005`.

| Stage | Value | 8-bit |
|-------|-------|-------|
| nightZenith | 0.005 | 1.3 |
| After tone map | 0.0015 → 0.05 | 12 |
| After gamma | 0.05^0.4545 → 0.26 | 6.5 |

**Fix:** Match the actual video frame analysis. The deepest dark period in the video has SKY at R=2 G=38 B=33 (lum=27) — that's `[0.008, 0.15, 0.13]` in normalized. Not RGB(0,0,0). Increase night luminance 3-5×.

## Root Cause #4: No Stars Visible

**Evidence:** `nightFactor = 0` at all times because the sun is always above the horizon from mouse tracking.

```glsl
float nightFactor = 1.0 - dayFactor; // derived from sunDir.y
float trueNight = smoothstep(-0.02, -0.15, sunDir.y); // requires sun below horizon
```

With sunDir.y ≈ 0.24 (always above horizon), both nightFactor and trueNight are 0.

**Fix:** Stars should render based on **mood**, not sun position. Add a `u_nightFactor` uniform from the mood system that overrides the computed night factor.

---

## Complete Fix Plan

### Fix 1: Time-based warmup (webgl-engine.js)
Replace frame-based warmup with time-based:
```javascript
// In engine: track elapsed time since benchmark completed
const WARMUP_DURATION = 2.0; // seconds
const warmup = Math.min(1, (now - benchmarkEndTime) / WARMUP_DURATION);
```
This ensures warmup reaches 1.0 after exactly 2 seconds regardless of frame rate.

### Fix 2: Mood-driven sun height (webgl-nature.js)
Add `u_sunHeight` uniform to MOODS. The sun follows the mouse but is offset by mood's sunHeight:
```glsl
float currentSunY = mix(0.15 + u_mouse.y * 1.0, 0.6, solarEase) + u_sunHeight;
```
At mood 0, u_sunHeight = -0.3 → sun below horizon. Stars visible.
At mood 3, u_sunHeight = 0.7 → sun high. Stars invisible.
Mouse provides ±0.1 offset for interactivity.

### Fix 3: Brighten scene values (webgl-nature.js)
| Parameter | Current | Fixed |
|-----------|---------|-------|
| nightZenith multiplier | 0.005 | 0.02 |
| nightHorizon multiplier | 0.015 | 0.06 |
| waterColor (night) | [0.01, 0.04, 0.08] | [0.03, 0.06, 0.10] |
| waterColor (dawn) | [0.03, 0.08, 0.12] | [0.08, 0.15, 0.20] |
| waterColor (midday) | [0.02, 0.06, 0.10] | [0.06, 0.12, 0.18] |
| waterColor (golden) | [0.04, 0.06, 0.07] | [0.10, 0.15, 0.14] |

### Fix 4: Mood-controlled nightFactor (webgl-nature.js)
Add a `u_nightFactor` uniform from the mood system. When mood is 0 or 5 (night/dusk), force nightFactor high. Used for star visibility and moon rendering.

### Fix 5: Remove "Rahatil Brand Loaded" artifact
The index.html has a leftover script artifact that triggers "Rahatil Brand Loaded". Clean up.

### Fix 6: Water base brightness boost
Multiply all water specular by 2× to ensure reflections are visible even in dark moods.

### Acceptence Criteria After Fixes

| Scene | Should be visible | Current state |
|-------|------------------|---------------|
| Night sky | R=2-10, G=30-50, B=25-40 (lum 25-40) | R=0, G=0, B=0 |
| Stars | Hundreds of visible points | None |
| Water surface | Visible dark teal with specular highlights | Near-black |
| Day sky | R=70-90, G=150-210, B=120-190 | Black (warmup) |
| Sun disk | Bright dot with glow ring | Hidden behind warmup |
| Mood transitions | Visible brightness shift between sections | Not visible |
