# WebGL Shader Implementation Spec — GLSL ES 3.0

## Overview

Single-pass fragment shader rendering an entire nature scene with day/night cycle. 
All scene elements are procedural (no textures needed) — computed entirely in GPU.

---

## Vertex Shader

Simple pass-through for full-screen quad:

```glsl
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
```

## Fragment Shader — Scene Render Order

### 1. Sky System

**Function: `vec3 renderSky(vec2 uv, float sunAngle)`**

Two-band gradient using sun position:
```
upperSky = lerp(nightSky, daySky, dayFactor)
lowerSky = lerp(nightHorizon, dayHorizon, dayFactor)
```

At sunrise/sunset, inject warm colors on the horizon band:
```
if sunHeight near 0:
    horizonGlow = warm orange/red, fading 30° above/below horizon
```

### 2. Sun/Moon

**Function: `float renderSun(vec2 uv, vec2 sunPos)`**

- Sun: Circle with soft-edge glow
- God rays: Radial lines from sun position during low-angle
- Moon: Circle with crescent via offset circle subtraction
- Moon glow: Subtle halo at night

### 3. Stars

**Function: `float renderStars(vec2 uv, float density)`**

Procedural using hash-based grid:
```
gridCell = floor(uv * starGrid)
hash = random(gridCell)
if hash > (1.0 - density): star at this cell
    brightness = sin(time + hash) * 0.5 + 0.5  // twinkle
    color = white with slight random tint
```

### 4. Clouds

**Function: `float renderClouds(vec2 uv, float time)`**

- 2-layer FBM noise (4-6 octaves of value noise)
- Layer 1: Large, slow-moving (cirrus)
- Layer 2: Smaller, faster (cumulus)
- Drift: uv.x += windSpeed * time

### 5. Terrain (Landscape)

**Function: `float renderTerrain(vec2 uv, float time)`**

Horizon line at ~40% screen height. 

Multiple terrain layers using summed sine waves with noise perturbation:
```
for each layer:
    height = sin(x * freq + time * waveSpeed) * amplitude
           + noise(x, layer) * perturbation
    height *= (1.0 - layer * 0.3)  // distance fog
```

5 layers:
- Layer 0: Far mountains (2 octaves, large amplitude, slow)
- Layer 1: Mid-hills (3 octaves, medium)
- Layer 2: Near hills (4 octaves, smaller)
- Layer 3: Foreground (5 octaves, detailed)
- Layer 4: Ground plane (flat with texture)

Each layer colored based on distance (atmospheric perspective):
```
far = desaturated, blends toward horizon color
near = saturated, green/brown
```

### 6. Water

**Function: `float renderWater(vec2 uv, float time)`**

If landscape has a valley/depression below a certain height:
```
waterLevel = terrainHeight - 0.1
if pixel height < waterLevel: render water
```

Water surface:
- Animated waves: sin(x * freq + time) * amplitude
- Reflection: mirror sky colors with distortion
- Shoreline: foam where water meets land

### 7. Trees/Vegetation

**Function: `float renderTrees(vec2 uv, float time)`**

Procedural tree silhouettes on terrain layers:
```
for each terrain layer:
    seed = hash(layerIndex)
    for n in 0..treeCount:
        treeX = noise(seed, n) // random x position
        treeHeight = noise(seed, n+1000) * maxHeight
        isVisible = uv.x near treeX AND uv.y above terrain
        render tree: triangle silhouette with slight sway
```

### 8. Particles

**Function: `float renderParticles(vec2 uv, float time, float dayFactor)`**

Two types:
1. **Fireflies** (night/dusk): Small bright dots, drifting upward with jitter
2. **Dust motes** (day): Tiny bright dots, floating slowly

Each particle: 
```
pos = hash based on grid cell + time * drift
visible if distance(uv, pos) < particleSize
brightness with slight twinkle
```

### 9. Atmosphere Overlay

**Function: `vec3 applyAtmosphere(vec3 color, vec2 uv)`**

- Fog: lerp toward fogColor based on distance from horizon
- Light rays: Radial from sun position, visible at low angles
- Vignette: Darken edges using distance from center
- Color grading: Apply warmth, saturation, brightness

---

## Noise Functions (included in shader)

```glsl
// Simple pseudo-random
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// 2D value noise
float noise(vec2 p) { /* bilinear interpolation of hash grid */ }

// Fractal Brownian Motion (FBM)
float fbm(vec2 p, int octaves) { /* layered noise with increasing frequency */ }
```

---

## Key Shader Constants

```glsl
#define STAR_GRID 200.0
#define CLOUD_OCTAVES 6
#define TERRAIN_LAYERS 5
#define TERRAIN_OCTAVES 5
#define TREE_COUNT 20
#define PARTICLE_COUNT 30
#define SUN_RADIUS 0.03
#define SUN_GLOW_RADIUS 0.15
#define HORIZON_Y 0.4
```

---

## Quality Control (via DRS tier)

| Feature | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|--------|--------|--------|--------|--------|
| Cloud octaves | 6 | 5 | 3 | 0 | 0 |
| Terrain layers | 5 | 4 | 3 | 2 | 1 |
| Terrain octaves | 5 | 4 | 3 | 2 | 1 |
| Tree count | 20 | 15 | 10 | 0 | 0 |
| Particle count | 30 | 20 | 10 | 0 | 0 |
| Water reflections | Full | Full | Simple | Off | Off |
| God rays | On | On | Off | Off | Off |
| Star field | Full | Full | Reduced | Off | Off |
