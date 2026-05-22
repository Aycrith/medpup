# WebGL Cinematic Nature Environment — Production Specification

## VISION
A full-screen WebGL2 GPU-rendered nature scene that serves as the living background for the entire MedPup website. The scene evolves through a day/night cycle synchronized to scroll position, creating an emotional narrative arc: **dark uncertainty → dawn hope → bright clarity → golden trust → dusk resolution**.

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                  HTML Overlay                        │
│  (Navigation, Content Sections, Calculator, Map,    │
│   FAQ, Footer — all existing templates preserved)    │
├─────────────────────────────────────────────────────┤
│           Full-Screen Canvas (<canvas id="v">)       │
│           z-index: 0, position: fixed                │
├─────────────────────────────────────────────────────┤
│           WebGL2 Rendering Engine                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Scroll/Camera│  │  Mood/Scene  │  │  Uniform   │  │
│  │  Controller  │  │   Manager    │  │   Pump     │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                │                 │         │
│         └────────────────┼─────────────────┘         │
│                          ▼                           │
│  ┌───────────────────────────────────────────────┐   │
│  │        GLSL Fragment Shader (Single Pass)      │   │
│  │  Sky · Sun/Moon · Stars · Landscape · Water    │   │
│  │  Vegetation · Atmosphere · Particles · Fog     │   │
│  └───────────────────────────────────────────────┘   │
│           1 draw call (TRIANGLE_STRIP, 0, 4)          │
└─────────────────────────────────────────────────────┘
```

---

## SHADER UNIFORM API

### Camera & Scroll
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_res` | vec2 | dynamic | Canvas resolution (px) |
| `u_time` | float | 0→∞ | Elapsed time (seconds) |
| `u_scroll` | float | 0.0-1.0 | Normalized scroll position |
| `u_scrollSmooth` | float | 0.0-1.0 | Interpolated smooth scroll |
| `u_camElevation` | float | -1.0-1.0 | Camera height in scene |
| `u_camFov` | float | 0.5-2.0 | Field of view multiplier |

### Day/Night Cycle
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_sunAngle` | float | 0.0-2π | Sun position in sky |
| `u_sunHeight` | float | -1.0-1.0 | Sun above/below horizon |
| `u_dayFactor` | float | 0.0-1.0 | 0=night, 1=midday |
| `u_moonPhase` | float | 0.0-1.0 | Moon illumination |

### Atmosphere
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_horizonColor` | vec3 | RGB | Horizon band color |
| `u_skyColor1` | vec3 | RGB | Upper sky color |
| `u_skyColor2` | vec3 | RGB | Lower sky color |
| `u_fogDensity` | float | 0.0-1.0 | Mist/fog intensity |
| `u_fogColor` | vec3 | RGB | Fog tint |
| `u_starDensity` | float | 0.0-1.0 | Star visibility |
| `u_starTwinkle` | float | 0.0-1.0 | Star twinkle speed |

### Landscape
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_landColor1` | vec3 | RGB | Near ground color |
| `u_landColor2` | vec3 | RGB | Far ground color |
| `u_landDetail` | float | 0.0-1.0 | Terrain detail level |
| `u_treeDensity` | float | 0.0-1.0 | Tree silhouette count |
| `u_grassWave` | float | 0.0-1.0 | Grass/tree sway |

### Water
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_waterLevel` | float | 0.0-1.0 | Water height in scene |
| `u_waterColor` | vec3 | RGB | Water tint |
| `u_waveAmp` | float | 0.0-1.0 | Wave amplitude |
| `u_waveFreq` | float | 0.0-1.0 | Wave frequency |
| `u_waterReflect` | float | 0.0-1.0 | Reflection intensity |

### Mood/Scene
| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_mood` | int | 0-5 | Scene mood index |
| `u_moodBlend` | float | 0.0-1.0 | Crossfade between moods |
| `u_vignette` | float | 0.0-1.0 | Edge darkening |
| `u_warmth` | float | 0.5-1.5 | Color temperature |
| `u_saturation` | float | 0.0-1.5 | Color saturation |
| `u_brightness` | float | 0.5-1.5 | Overall brightness |
| `u_drsTier` | float | 0.0-1.0 | Quality tier |
| `u_warmup` | float | 0.0-1.0 | Startup fade-in |

---

## MOOD SYSTEM (Scroll-Synced)

Each scroll section maps to a scene mood:

| Mood ID | Name | Section | Sun | Sky | Landscape | Water | Stars | Feeling |
|---------|------|---------|-----|-----|-----------|-------|-------|---------|
| 0 | **Night** | Hero (Problem) | Below horizon | Deep navy/indigo | Dark silhouettes | Dark, still | Full | Isolation, uncertainty |
| 1 | **Dawn** | Intro | Rising, golden | Purple→orange gradient | Emerging green | Calm ripples | Fading | Hope, new beginning |
| 2 | **Morning** | How It Works | Low, warm | Soft blue/teal | Bright green | Clear, flowing | Gone | Clarity, action |
| 3 | **Midday** | Calculator | High, bright | Clear blue | Vibrant green | Sparkling | Gone | Truth, transparency |
| 4 | **Golden Hour** | Clinics | Setting, warm | Amber/orange | Warm gold-green | Golden reflections | Beginning | Trust, warmth |
| 5 | **Dusk** | CTA/Trust | Below horizon | Purple/magenta | Darkening | Deep blue | Emerging | Resolution, peace |

### Transition Behavior
- Moods blend over 2-3 seconds of scroll using `u_moodBlend`
- `u_sunAngle` smoothly interpolates between mood positions
- Colors lerp via GPU (no snapping)
- Stars fade in/out based on sun height

---

## SCENE RENDERING LAYERS (in shader order)

All layers are computed in the fragment shader from back to front:

```
Layer 0: Sky Gradient
  - Two-band gradient (upper/lower) based on sun position
  - Color varies with day/night cycle
  
Layer 1: Sun/Moon
  - Sun: Bright disk with glow halo, god rays at sunrise/sunset
  - Moon: Crescent/phase, subtle glow, visible below horizon
  
Layer 2: Stars
  - Procedural star field using hash functions
  - Density based on u_starDensity (night = full, day = none)
  - Twinkle animation via u_time
  - Color: white with slight blue/yellow variation
  
Layer 3: Clouds
  - Procedural noise-based (FBM simplex or value noise)
  - Semi-transparent, drift with wind
  - Layer 1: High thin clouds (cirrus)
  - Layer 2: Low puffy clouds (cumulus)
  
Layer 4: Far Landscape
  - Mountain/hill silhouettes using layered sine waves
  - Fogged based on distance (atmospheric perspective)
  - Color: blends toward sky color at horizon
  
Layer 5: Mid Landscape
  - Rolling hills with more detail
  - Tree line silhouettes (procedural placement)
  - Occasional river/clearing
  
Layer 6: Near Landscape
  - Ground plane with texture variation
  - Grass blades (animated wave)
  - More tree silhouettes
  
Layer 7: Water (if visible)
  - Reflective surface below horizon
  - Animated waves (sine + noise displacement)
  - Reflection of sky colors
  - Shoreline foam
  
Layer 8: Atmosphere
  - Mist/fog layer near horizon
  - Light rays (volumetric) during sunrise/sunset
  - Vignette around edges
  
Layer 9: Particles (overlay)
  - Fireflies at night/dusk
  - Dust motes in sunlight
  - Falling leaves in autumn/wind
  - Small floating seeds
```

---

## PERFORMANCE TIERS

| Tier | Target | Resolution | Features |
|------|--------|-----------|----------|
| 0 | Desktop high-end | Native | All layers, max samples |
| 1 | Desktop mid/low | Native | Reduced clouds, fewer stars |
| 2 | Tablet | 80% | No particles, fewer terrain octaves |
| 3 | Mobile high | 60% | No clouds, no water, 2 terrain layers |
| 4 | Mobile low | 50% | No particles, no clouds, 1 terrain, simple sky |

- Tier auto-detected via WebGL benchmark + screen size
- `u_drsTier` controls shader complexity
- Canvas resolution scaled down on low tiers

---

## FILE STRUCTURE

```
website/static/js/
├── webgl-engine.js        # Core WebGL2 engine (context, loop, fallback)
├── webgl-nature.js        # Nature scene shaders + config + uniform management
└── webgl-integration.js   # Scroll tracking, mood mapping, section detection
```

---

## FALLBACK STRATEGY

If WebGL2 unavailable:
1. Detect: `canvas.getContext('webgl2')`
2. If fails: Keep existing Canvas 2D particle system
3. If partially supported: Reduce to minimal scene (sky + terrain only)

---

## BUILD & DEPLOYMENT

- All JS files in `website/static/js/` — served directly
- Canvas element added to `layouts/_default/baseof.html` (already exists)
- CSS: `.cinematic-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }`
- Content wrapper needs `position: relative; z-index: 1;`
- Build: `hugo --minify` — no dependencies
