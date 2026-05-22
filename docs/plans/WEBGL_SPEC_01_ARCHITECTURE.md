# WebGL Cinematic Nature Environment — v2 Production Spec

## Architecture (Updated v2)

### Shader Uniform API (v2 adds)

| Uniform | Type | Range | Description |
|---------|------|-------|-------------|
| `u_camFOV` | float | 0.8-1.2 | Field of view (per-mood zoom) |
| `u_camYaw` | float | -0.1-0.1 | Horizontal camera shift (mouse parallax) |
| `u_lightSweep` | float | 0.0-1.0 | Light sweep animation (section transitions) |
| `u_godRayIntensity` | float | 0.0-1.0 | Volumetric light scattering strength |
| `u_warpIntensity` | float | 0.0-1.0 | Mouse warp distortion strength |

### Mood Definitions (v2)

Each mood now includes `godRayIntensity` and `warpIntensity`:

| Mood | God Rays | Warp | Notes |
|------|----------|------|-------|
| Night (0) | 0.0 (off) | 0.3 | Stars only |
| Dawn (1) | 0.6 (peak) | 0.4 | Sunrise rays |
| Morning (2) | 0.2 | 0.5 | Subtle rays |
| Midday (3) | 0.0 (off) | 0.6 | Clear sky |
| Golden Hour (4) | 0.5 | 0.45 | Sunset rays |
| Dusk (5) | 0.0 (off) | 0.35 | Stars re-emerge |

### Shader Improvements (v1 → v2)

| Feature | v1 | v2 |
|---------|----|----|
| Noise | Basic value noise | 5th-order smooth noise + domain-warped FBM |
| Terrain layers | 5 | 6 with time-wobbled frequencies |
| Cloud layers | 2 (cirrus, cumulus) | 3 (cirrus, altocumulus, cumulus) |
| Cloud quality | Basic FBM | Domain-warped FBM, sun tinting |
| Water | 2-wave, simple reflection | 3-wave, Fresnel reflections, foam |
| Trees | Single cone shape | Pine + deciduous, wind sway |
| Stars | Grid-based (grid artifacts) | 3×3 neighbor check, magnitude |
| Particles | Fireflies/dust basic | Fireflies with pulsing, pollen dust |
| Sun | Single glow | Core + inner glow + outer glow |
| Moon | None | Crescent phase + glow |
| God rays | None | Volumetric ray-march |
| Mouse warp | None | UV distortion with falloff |
| Light sweep | None | Section transition effect |
| Camera yaw | None | Mouse-reactive horizontal shift |
| Camera FOV | None | Per-mood field of view |
| Color grading | Basic (warmth/sat/vignette) | Film S-curve + enhanced grading |

### Engine Improvements (v1 → v2)

| Feature | v1 | v2 |
|---------|----|----|
| DRS detection | User-agent only | User-agent + GPU renderer string |
| Performance | Static tiers | GPU benchmark (500ms), adaptive frame-time monitoring |
| Frame monitoring | None | 30-frame rolling average, auto-downscale |
| Warmup | frameCount-based only | Benchmark + warmup fade |
| Light sweep | None | Triggered on mood change |
| Section FOV | None | Per-section field of view map |

### Performance Budget

| DRS Tier | Resolution Scale | Features |
|----------|-----------------|----------|
| 0 (Desktop high) | 1.0×dpr | All layers, 6 cloud octaves, 6 terrain layers, 30 trees, 30 particles, god rays, moon, foam |
| 1 (Desktop low) | 1.0×dpr | 5 cloud octaves, 5 terrain layers, 25 trees, 25 particles, god rays reduced |
| 2 (Tablet) | 0.8×dpr | 4 cloud octaves, 4 terrain layers, 20 trees, 20 particles, no 3rd cloud layer |
| 3 (Mobile high) | 0.6×dpr | 3 cloud octaves, 3 terrain layers, 15 trees, 15 particles, no god rays |
| 4 (Mobile low) | 0.5×dpr | 2 cloud octaves, 2 terrain layers, 10 trees, 10 particles, simple sky |

Auto-downscale: additional 0.75× if 30-frame avg exceeds 24ms (below ~42fps).

### Target Render Path (single draw call)

```
gl.clearColor(0, 0, 0)
gl.clear(COLOR_BUFFER_BIT)
gl.drawArrays(TRIANGLE_STRIP, 0, 4)  // single quad, all in shader
```

Total uniforms: 33 (28 scene + 5 camera/engine)
