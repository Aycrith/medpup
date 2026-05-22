// ============================================================
// MedPup WebGL2 Nature Scene — Shaders + Mood Configuration
// V2: Volumetric clouds, god rays, mouse warp, film grade
// Procedural nature landscape with day/night cycle
// ============================================================
(function () {
    'use strict';

    // --- MOOD DEFINITIONS (v2 — richer colors) ---
    const MOODS = [
        { // 0: Night — Hero (The Problem) — deep isolation
            name: 'night',
            sunAngle: -0.35, sunHeight: -0.3,
            skyTop: [0.01, 0.005, 0.08],
            skyBottom: [0.03, 0.02, 0.15],
            horizonGlow: [0.06, 0.04, 0.14],
            landNear: [0.03, 0.06, 0.02],
            landFar: [0.01, 0.03, 0.015],
            waterColor: [0.005, 0.01, 0.04],
            fogColor: [0.01, 0.01, 0.06],
            fogDensity: 0.35,
            starDensity: 1.0,
            starBrightness: 1.0,
            warmth: 0.65,
            saturation: 0.55,
            vignette: 0.45,
            godRayIntensity: 0,
            warpIntensity: 0.3,
        },
        { // 1: Dawn — Intro (hope emerging)
            name: 'dawn',
            sunAngle: 0.0, sunHeight: 0.0,
            skyTop: [0.12, 0.06, 0.25],
            skyBottom: [0.80, 0.45, 0.25],
            horizonGlow: [1.0, 0.55, 0.25],
            landNear: [0.12, 0.18, 0.06],
            landFar: [0.22, 0.12, 0.08],
            waterColor: [0.55, 0.35, 0.18],
            fogColor: [0.65, 0.45, 0.30],
            fogDensity: 0.55,
            starDensity: 0.25,
            starBrightness: 0.3,
            warmth: 1.15,
            saturation: 0.85,
            vignette: 0.2,
            godRayIntensity: 0.6,
            warpIntensity: 0.4,
        },
        { // 2: Morning — How It Works (clarity)
            name: 'morning',
            sunAngle: 0.45, sunHeight: 0.35,
            skyTop: [0.18, 0.32, 0.58],
            skyBottom: [0.45, 0.60, 0.72],
            horizonGlow: [0.75, 0.65, 0.45],
            landNear: [0.18, 0.32, 0.10],
            landFar: [0.22, 0.32, 0.16],
            waterColor: [0.18, 0.48, 0.52],
            fogColor: [0.55, 0.60, 0.65],
            fogDensity: 0.15,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmth: 1.0,
            saturation: 1.1,
            vignette: 0.08,
            godRayIntensity: 0.2,
            warpIntensity: 0.5,
        },
        { // 3: Midday — Calculator (transparency)
            name: 'midday',
            sunAngle: 1.3, sunHeight: 0.85,
            skyTop: [0.12, 0.38, 0.68],
            skyBottom: [0.35, 0.68, 0.78],
            horizonGlow: [0.55, 0.72, 0.78],
            landNear: [0.22, 0.38, 0.08],
            landFar: [0.28, 0.42, 0.18],
            waterColor: [0.12, 0.52, 0.58],
            fogColor: [0.45, 0.62, 0.68],
            fogDensity: 0.08,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmth: 0.95,
            saturation: 1.2,
            vignette: 0.03,
            godRayIntensity: 0.0,
            warpIntensity: 0.6,
        },
        { // 4: Golden Hour — Clinics (trust)
            name: 'golden_hour',
            sunAngle: 1.9, sunHeight: 0.15,
            skyTop: [0.28, 0.16, 0.42],
            skyBottom: [0.92, 0.50, 0.20],
            horizonGlow: [1.0, 0.50, 0.10],
            landNear: [0.32, 0.28, 0.06],
            landFar: [0.38, 0.22, 0.10],
            waterColor: [0.68, 0.42, 0.12],
            fogColor: [0.75, 0.50, 0.28],
            fogDensity: 0.22,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmth: 1.25,
            saturation: 1.05,
            vignette: 0.12,
            godRayIntensity: 0.5,
            warpIntensity: 0.45,
        },
        { // 5: Dusk — CTA (resolution)
            name: 'dusk',
            sunAngle: 2.4, sunHeight: -0.2,
            skyTop: [0.04, 0.01, 0.12],
            skyBottom: [0.35, 0.10, 0.20],
            horizonGlow: [0.55, 0.20, 0.18],
            landNear: [0.04, 0.035, 0.02],
            landFar: [0.06, 0.025, 0.03],
            waterColor: [0.08, 0.03, 0.08],
            fogColor: [0.18, 0.08, 0.12],
            fogDensity: 0.38,
            starDensity: 0.65,
            starBrightness: 0.7,
            warmth: 0.85,
            saturation: 0.75,
            vignette: 0.35,
            godRayIntensity: 0.0,
            warpIntensity: 0.35,
        },
    ];

    // --- FRAGMENT SHADER SOURCE (GLSL ES 3.0) v2 ---
    function getFragmentShaderSource() {
        return [
            '#version 300 es',
            'precision highp float;',

            'out vec4 fragColor;',

            'uniform vec2  u_res;',
            'uniform float u_time;',
            'uniform float u_delta;',
            'uniform float u_scroll;',
            'uniform float u_scrollSmooth;',
            'uniform float u_scrollVelocity;',
            'uniform vec2  u_mouse;',
            'uniform float u_camElevation;',
            'uniform float u_camFOV;',
            'uniform float u_camYaw;',
            'uniform int   u_mood;',
            'uniform float u_moodBlend;',
            'uniform float u_drsTier;',
            'uniform float u_warmup;',
            'uniform float u_lightSweep;',

            // Scene uniforms
            'uniform float u_sunAngle;',
            'uniform float u_sunHeight;',
            'uniform float u_dayFactor;',
            'uniform vec3  u_skyTop;',
            'uniform vec3  u_skyBottom;',
            'uniform vec3  u_horizonGlow;',
            'uniform vec3  u_landNear;',
            'uniform vec3  u_landFar;',
            'uniform vec3  u_waterColor;',
            'uniform vec3  u_fogColor;',
            'uniform float u_fogDensity;',
            'uniform float u_starDensity;',
            'uniform float u_starBrightness;',
            'uniform float u_warmth;',
            'uniform float u_saturation;',
            'uniform float u_vignette;',
            'uniform float u_godRayIntensity;',
            'uniform float u_warpIntensity;',

            // ==========================================================',
            // ---- NOISE & UTILITY FUNCTIONS ----',
            // ==========================================================',

            'float hash21(vec2 p) {',
            '    p = fract(p * vec2(234.34, 435.345));',
            '    p += dot(p, p + 19.19);',
            '    return fract(p.x * p.y);',
            '}',

            'float hash(vec2 p) {',
            '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
            '}',

            'float hash12(vec2 p) {',
            '    p = fract(p * 0.3183099 + .1);',
            '    p *= 17.0;',
            '    return fract(p.x * p.y * (p.x + p.y));',
            '}',

            // Smooth 2D value noise
            'float noise(vec2 p) {',
            '    vec2 i = floor(p);',
            '    vec2 f = fract(p);',
            '    f = f * f * (3.0 - 2.0 * f);',
            '    float a = hash(i);',
            '    float b = hash(i + vec2(1.0, 0.0));',
            '    float c = hash(i + vec2(0.0, 1.0));',
            '    float d = hash(i + vec2(1.0, 1.0));',
            '    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
            '}',

            // Improved smoother noise (5th-order polynomial)
            'float snoise(vec2 p) {',
            '    vec2 i = floor(p);',
            '    vec2 f = fract(p);',
            '    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);',
            '    float a = hash(i);',
            '    float b = hash(i + vec2(1.0, 0.0));',
            '    float c = hash(i + vec2(0.0, 1.0));',
            '    float d = hash(i + vec2(1.0, 1.0));',
            '    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
            '}',

            // FBM with domain rotation (improved quality, less grid artifacts)
            'float fbm(vec2 p) {',
            '    float v = 0.0;',
            '    float a = 0.5;',
            '    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));',
            '    int octs = int(min(6.0, 7.0 - u_drsTier * 2.0));',
            '    for (int i = 0; i < 6; i++) {',
            '        if (i >= octs) break;',
            '        v += a * snoise(p);',
            '        p = rot * p * 2.1;',
            '        a *= 0.48;',
            '    }',
            '    return v;',
            '}',

            // Domain-warped FBM (more organic/less grid-like)
            'float fbmWarp(vec2 p) {',
            '    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));',
            '    return fbm(p + q * 1.5);',
            '}',

            // ==========================================================',
            // ---- SKY SYSTEM ----',
            // ==========================================================',

            'vec3 renderSky(vec2 uv, float sunH, vec3 top, vec3 bot, vec3 glow, vec2 sunPos) {',
            '    float horizon = 0.35 + u_camElevation * 0.1;',
            '    float heightFrac = (uv.y - horizon) / (1.0 - horizon);',

            // 3-band sky: top, mid, horizon
            '    vec3 sky = vec3(0.0);',
            '    if (heightFrac > 0.3) {',
            '        float t = (heightFrac - 0.3) / 0.7;',
            '        sky = mix(bot, top, t);',
            '    } else {',
            '        float t = heightFrac / 0.3;',
            '        sky = mix(glow * 1.2, bot, t);',
            '    }',

            // Horizon glow (wider, softer)
            '    float distHorizon = 1.0 - abs(uv.y - horizon) * 6.0;',
            '    distHorizon = max(0.0, distHorizon);',
            '    sky += glow * pow(distHorizon, 3.0) * 0.6;',

            // Sun glow at low angles
            '    if (sunH < 0.35 && sunH > -0.25) {',
            '        float sg = exp(-distance(uv, sunPos) * 8.0);',
            '        sky += glow * sg * 0.4 * (1.0 - abs(sunH) * 2.5);',
            '    }',

            '    return sky;',
            '}',

            // ==========================================================',
            // ---- SUN / MOON ----',
            // ==========================================================',

            'float renderSun(vec2 uv, vec2 sunPos, float sunH) {',
            '    if (sunH < -0.15) return 0.0;',
            '    float d = distance(uv, sunPos);',

            // Sun core
            '    float core = 1.0 - smoothstep(0.0, 0.025, d);',

            // Inner glow
            '    float innerGlow = exp(-d * d * 600.0);',

            // Outer glow
            '    float outerGlow = exp(-d * d * 40.0);',

            '    return max(core * 1.2, max(innerGlow * 0.5, outerGlow * 0.15));',
            '}',

            'float renderMoon(vec2 uv, float sunH) {',
            '    if (sunH > 0.0) return 0.0;',
            '    float moonX = 0.75;',
            '    float moonY = 0.75 + sin(u_time * 0.05) * 0.02;',
            '    vec2 moonPos = vec2(moonX, moonY);',
            '    float d = distance(uv, moonPos);',

            // Moon glow
            '    float glow = exp(-d * d * 100.0) * 0.15;',

            // Moon disk
            '    float disk = 1.0 - smoothstep(0.0, 0.022, d);',

            // Crescent (subtract right edge)
            '    vec2 crescentUV = vec2(uv.x - 0.008, uv.y + 0.005);',
            '    float d2 = distance(crescentUV, moonPos);',
            '    float crescent = 1.0 - smoothstep(0.0, 0.022, d2);',
            '    disk = max(0.0, disk - crescent * 0.7);',

            '    vec3 moonCol = vec3(0.85, 0.88, 0.95);',
            '    return glow * 1.5 + disk * 0.9;',
            '}',

            // ==========================================================',
            // ---- STARS (with magnitude variation) ----',
            // ==========================================================',

            'float renderStars(vec2 uv, float horizon, float density) {',
            '    if (density < 0.01) return 0.0;',
            '    float stars = 0.0;',

            '    vec2 starUV = vec2(uv.x * 3.0, (1.0 - uv.y) * 6.0);',
            '    vec2 cell = floor(starUV);',
            '    vec2 cellUV = fract(starUV);',

            // Check 3x3 neighbor area to avoid grid artifacts
            '    for (int dx = -1; dx <= 1; dx++) {',
            '        for (int dy = -1; dy <= 1; dy++) {',
            '            vec2 neighbor = cell + vec2(float(dx), float(dy));',
            '            float cellHash = hash12(neighbor);',
            '            float starChance = density * 0.7;',
            '            if (cellHash < starChance) {',
            '                vec2 starPos = vec2(hash12(neighbor + 10.0), hash12(neighbor + 20.0));',
            '                float dist = distance(cellUV - vec2(float(dx), float(dy)), starPos);',
            '                float magnitude = hash12(neighbor + 30.0);',
            '                float size = (0.002 + magnitude * 0.015) * (1.0 + u_drsTier * 0.3);',
            '                float twinkle = sin(u_time * (1.5 + magnitude * 3.0) + hash12(neighbor + 40.0) * 6.28)',
            '                              * 0.5 + 0.5;',
            '                twinkle = pow(twinkle, 0.5 + magnitude * 2.0);',
            '                if (dist < size) {',
            '                    float bright = (1.0 - dist / size) * magnitude * twinkle * 1.5;',
            '                    stars = max(stars, bright);',
            '                }',
            '            }',
            '        }',
            '    }',

            '    return stars * u_starBrightness;',
            '}',

            // ==========================================================',
            // ---- CLOUDS (3-layer volumetric) ----',
            // ==========================================================',

            'float renderClouds(vec2 uv, float horizon, float time) {',
            '    float cUvY = (uv.y - horizon) / (1.0 - horizon);',
            '    if (cUvY < 0.0 || cUvY > 1.0) return 0.0;',

            // Layer 1: High cirrus (thin, wispy, fast)
            '    vec2 p1 = vec2(uv.x * 0.4 + time * 0.006, cUvY * 0.3 + time * 0.003);',
            '    float c1 = fbmWarp(p1);',
            '    c1 = smoothstep(0.45, 0.72, c1) * 0.25;',

            // Layer 2: Mid-level altocumulus (patchy)
            '    vec2 p2 = vec2(uv.x * 0.9 + time * 0.008 + 50.0, cUvY * 0.5 + time * 0.004 + 20.0);',
            '    float c2 = fbmWarp(p2);',
            '    c2 = smoothstep(0.42, 0.72, c2) * 0.4;',

            // Layer 3: Low cumulus (puffy) — only at mid/high quality
            '    float c3 = 0.0;',
            '    if (u_drsTier < 3.0) {',
            '        vec2 p3 = vec2(uv.x * 1.8 + time * 0.012 + 120.0, cUvY * 0.7 + time * 0.005 + 80.0);',
            '        c3 = fbmWarp(p3);',
            '        c3 = smoothstep(0.48, 0.8, c3) * 0.5;',
            '    }',

            // Cloud color varies with sun — warmer at dawn/dusk
            '    float altitudeFade = 1.0 - cUvY;',
            '    return (c1 + c2 + c3) * (0.3 + altitudeFade * 0.7);',
            '}',

            // Cloud shadows on terrain
            'float cloudShadow(vec2 uv, float horizon, float time) {',
            '    float cUvY = (uv.y - horizon) / (1.0 - horizon);',
            '    if (cUvY < 0.0) {',
            // Map terrain horizon to cloud UV
            '        vec2 cloudP = vec2(uv.x * 0.8 + time * 0.008, 0.3 + time * 0.004);',
            '        float shadow = fbmWarp(cloudP);',
            '        return smoothstep(0.55, 0.8, shadow) * 0.2;',
            '    }',
            '    return 0.0;',
            '}',

            // ==========================================================',
            // ---- TERRAIN (6-layer, organic) ----',
            // ==========================================================',

            'float terrainHeight(float x, float time) {',
            '    float h = 0.0;',
            '    int lyrs = int(min(6.0, 6.0 - u_drsTier));',
            '    float amp = 0.18;',
            '    float freq = 0.8;',
            '    for (int i = 0; i < 6; i++) {',
            '        if (i >= lyrs) break;',
            '        float fi = float(i);',
            '        float n = snoise(vec2(x * freq + fi * 20.0 + sin(time * 0.05 + fi) * 0.3, fi * 3.0));',
            '        h += max(-0.1, n) * amp;',
            '        freq *= 2.5 + sin(time * 0.08 + fi) * 0.3;',
            '        amp *= 0.6;',
            '    }',
            '    return h + 0.1;',
            '}',

            'float renderTerrain(vec2 uv, float horizon, float time) {',
            '    float aspect = u_res.x / u_res.y;',
            '    float x = (uv.x - 0.5) * aspect * 3.0;',
            '    float detail = fbmWarp(vec2(x * 5.0 + time * 0.015, 0.0));',

            '    float h = terrainHeight(x, time) + detail * 0.06;',
            '    float yOffset = u_camElevation * 0.12;',
            '    float terrainY = horizon + h + yOffset;',

            '    if (uv.y < terrainY) return terrainY - uv.y;',
            '    return -1.0;',
            '}',

            // ==========================================================',
            // ---- WATER (with reflection + foam) ----',
            // ==========================================================',

            'vec3 renderWater(vec2 uv, vec2 refUV, float horizon, float time, float terrainH,',
            '    vec3 wColor, vec3 skyTop, vec3 skyBot, vec3 horizonGlow, vec2 sunPos, float sunH) {',
            '    if (terrainH < 0.001) return vec3(-1.0);',

            '    float waterBase = horizon - 0.01 + u_camElevation * 0.08;',

            // Complex wave system (3 octaves)
            '    float wave = 0.0;',
            '    wave += sin(uv.x * 8.0 + time * 0.6) * 0.008;',
            '    wave += sin(uv.x * 16.0 + time * 1.1 + 2.0) * 0.005;',
            '    wave += sin(uv.x * 32.0 + time * 1.8 + 4.0) * 0.003;',

            '    float waterY = waterBase + wave;',

            // Check if pixel is in water zone (valley between terrain)
            '    if (uv.y < waterY && uv.y < waterBase + 0.08) {',
            // Sky reflection (mirrored with wave distortion)
            '        vec2 rUV = vec2(refUV.x + wave * 2.0, refUV.y * (1.0 + wave * 3.0));',
            '        vec3 reflected = renderSky(rUV, sunH, skyTop, skyBot, horizonGlow, sunPos);',

            // Fresnel effect (more reflection at shallow angle)
            '        float fresnel = pow(1.0 - abs((uv.y - waterY) / 0.08), 2.0);',
            '        vec3 col = mix(wColor, reflected, 0.25 + fresnel * 0.3);',

            // Specular sun highlight
            '        float spec = pow(max(0.0, sin(uv.x * 25.0 + time * 0.7) * cos(uv.y * 15.0 + time * 0.5)), 12.0);',
            '        col += vec3(1.0, 0.95, 0.8) * spec * 0.2;',

            // Shoreline foam
            '        float foamUV = 1.0 - abs(uv.y - waterY) * 15.0;',
            '        float foam = smoothstep(0.0, 1.0, foamUV) * 0.15;',
            '        foam *= sin(uv.x * 40.0 + time * 2.0) * 0.5 + 0.5;',
            '        col += vec3(0.9, 0.95, 1.0) * foam;',

            '        return col;',
            '    }',
            '    return vec3(-1.0);',
            '}',

            // ==========================================================',
            // ---- TREES (organic silhouettes) ----',
            // ==========================================================',

            'float renderTrees(vec2 uv, float horizon, float time, float terrainH) {',
            '    if (terrainH < 0.01) return 0.0;',
            '    float aspect = u_res.x / u_res.y;',
            '    float x = (uv.x - 0.5) * aspect * 3.0;',
            '    float trees = 0.0;',

            '    int count = int(min(30.0, 25.0 + 10.0 * (1.0 - u_drsTier * 0.2)));',
            '    for (int i = 0; i < 30; i++) {',
            '        if (i >= count) break;',
            '        float fi = float(i);',
            '        float tx = (hash12(vec2(fi, 0.0)) * 2.0 - 1.0) * 2.2;',
            '        float th = 0.04 + hash12(vec2(fi, 10.0)) * 0.18;',

            // Tree type: 0 = pine (cone), 1 = round (deciduous)
            '        float type = hash12(vec2(fi, 50.0));',
            '        float tw = 0.008 + type * 0.02;',
            '        float sway = sin(time * 0.4 + fi * 1.7) * 0.004 * (1.0 + type * 0.5);',

            '        float distX = abs(x - tx - sway);',
            '        if (distX < tw && uv.y < horizon + terrainH && uv.y > horizon + terrainH - th) {',
            '            float heightFrac = (horizon + terrainH - uv.y) / th;',
            '            float treeShape = 0.0;',

            // Pine tree (cone shape)
            '            if (type < 0.5) {',
            '                float coneWidth = 1.0 - heightFrac;',
            '                treeShape = 1.0 - distX / (tw * coneWidth);',
            '                treeShape *= smoothstep(0.0, 0.2, heightFrac);',
            '            }',
            // Deciduous (round canopy on trunk)
            '            else {',
            '                float trunkH = 0.6;',
            '                if (heightFrac < trunkH) {',
            '                    treeShape = 1.0 - distX / tw * 3.0;',
            '                    treeShape *= 1.0 - heightFrac / trunkH;',
            '                } else {',
            '                    float canopyFrac = (heightFrac - trunkH) / (1.0 - trunkH);',
            '                    float canopyR = tw * 1.5 * (1.0 - canopyFrac * 0.3);',
            '                    treeShape = 1.0 - distX / canopyR;',
            '                    treeShape *= 1.0 - canopyFrac;',
            '                }',
            '            }',

            '            treeShape = max(0.0, treeShape);',
            '            trees = max(trees, treeShape * 0.7);',
            '        }',
            '    }',
            '    return trees;',
            '}',

            // ==========================================================',
            // ---- PARTICLES (fireflies + dust + pollen) ----',
            // ==========================================================',

            'float renderParticles(vec2 uv, float horizon, float time, float dayFactor) {',
            '    int count = int(min(30.0, 25.0 + 25.0 * (1.0 - u_drsTier * 0.25)));',
            '    float result = 0.0;',

            '    for (int i = 0; i < 30; i++) {',
            '        if (i >= count) break;',
            '        float fi = float(i);',

            // Fireflies — near ground, drifting
            '        vec2 pos;',
            '        if (dayFactor < 0.35) {',
            // Fireflies hover near terrain
            '            pos = vec2(',
            '                hash12(vec2(fi, 100.0)) * 1.6 - 0.3,',
            '                horizon + 0.02 + hash12(vec2(fi, 200.0)) * 0.3',
            '            );',
            '            pos.x += sin(time * 0.2 + fi * 2.3) * 0.12;',
            '            pos.y += sin(time * 0.35 + fi * 3.7 + 1.0) * 0.06;',
            '        } else {',
            // Dust motes / pollen — float in sky
            '            pos = vec2(',
            '                hash12(vec2(fi, 300.0)) * 1.6 - 0.3,',
            '                horizon + 0.15 + hash12(vec2(fi, 400.0)) * 0.5',
            '            );',
            '            pos.x += sin(time * 0.15 + fi * 1.1) * 0.15;',
            '            pos.y += sin(time * 0.2 + fi * 2.3 + 1.0) * 0.08;',
            '        }',

            '        float size = dayFactor < 0.35 ? 0.004 : 0.0015;',
            '        float brightness = dayFactor < 0.35 ? 0.9 : 0.15;',
            '        float pulse = sin(time * (1.5 + fi * 0.5) + fi * 4.0) * 0.5 + 0.5;',
            '        pulse = pow(pulse, 3.0);',

            '        float dist = distance(uv, pos);',
            '        if (dist < size) {',
            '            float val = brightness * (1.0 - dist / size);',
            '            val *= (dayFactor < 0.35 ? pulse : (sin(time + fi) * 0.3 + 0.7));',
            '            result = max(result, val);',
            '        }',
            '    }',
            '    return result;',
            '}',

            // ==========================================================',
            // ---- GOD RAYS (volumetric light scattering) ----',
            // ==========================================================',

            'float godRays(vec2 uv, float horizon, vec2 sunPos, float intensity) {',
            '    if (intensity < 0.01) return 0.0;',
            '    if (uv.y < horizon - 0.1) return 0.0;',

            '    vec2 dir = sunPos - uv;',
            '    float dist = length(dir);',
            '    dir = normalize(dir);',

            // Volumetric ray march
            '    float rays = 0.0;',
            '    float stepSize = 0.02;',
            '    float steps = 20.0 - u_drsTier * 3.0;',
            '    float energy = intensity * 0.5;',

            '    for (float i = 0.0; i < 24.0; i += 1.0) {',
            '        if (i >= steps) break;',
            '        vec2 sampleUV = uv + dir * i * stepSize;',
            '        if (sampleUV.x < 0.0 || sampleUV.x > 1.0) break;',

            // Cloud noise creates rays
            '        float cloudNoise = fbm(vec2(sampleUV.x * 2.0 + u_time * 0.005, sampleUV.y * 0.5));',
            '        float rayDensity = max(0.0, 1.0 - cloudNoise * 3.0);',
            '        rays += rayDensity * energy * (1.0 - i / steps);',
            '        energy *= 0.95;',
            '    }',

            '    return rays * 0.3;',
            '}',

            // ==========================================================',
            // ---- MOUSE WARP ----',
            // ==========================================================',

            // Returns warped UV based on mouse position (subtle distortion)
            'vec2 mouseWarp(vec2 uv, float intensity) {',
            '    if (intensity < 0.01) return uv;',
            '    vec2 mouseUV = u_mouse;',
            '    vec2 delta = uv - mouseUV;',
            '    float dist = length(delta);',
            '    float warpStrength = intensity * 0.03;',
            '    float falloff = exp(-dist * dist * 20.0);',
            '    return uv + delta * falloff * warpStrength;',
            '}',

            // ==========================================================',
            // ---- LIGHT SWEEP (section transition effect) ----',
            // ==========================================================',

            'float lightSweep(vec2 uv, float sweep) {',
            '    if (sweep < 0.01) return 0.0;',
            '    float pos = sweep * 1.4 - 0.2;',
            '    float dist = abs(uv.x - pos);',
            '    float band = exp(-dist * dist * 200.0);',
            '    return band * 0.15 * (1.0 - sweep);',
            '}',

            // ==========================================================',
            // ---- COLOR GRADING (film-grade) ----',
            // ==========================================================',

            // Film contrast curve (soft S-curve)
            'float filmContrast(float x) {',
            '    return x * (x * (x * (x * (x - 1.0) + 1.0) + 1.0) + 0.5);',
            '}',

            'vec3 gradeColor(vec3 color, float warmth, float sat, float vig, vec2 uv) {',
            // White balance
            '    color *= vec3(warmth, 1.0, 1.0 - (warmth - 1.0) * 0.5);',

            // Film contrast
            '    color.r = filmContrast(color.r);',
            '    color.g = filmContrast(color.g);',
            '    color.b = filmContrast(color.b);',

            // Saturation (subtle)
            '    float gray = dot(color, vec3(0.299, 0.587, 0.114));',
            '    color = mix(vec3(gray), color, sat);',

            // Vignette (ellipse)
            '    vec2 vigUV = (uv - 0.5) * 1.3;',
            '    vigUV.x *= u_res.x / u_res.y;',
            '    float vigAmount = 1.0 - dot(vigUV, vigUV) * vig;',
            '    color *= max(0.0, vigAmount);',

            '    return max(vec3(0.0), color);',
            '}',

            // ==========================================================',
            // ---- MAIN ----',
            // ==========================================================',

            'void main() {',
            '    vec2 uv = gl_FragCoord.xy / u_res;',

            // Apply mouse warp first
            '    uv = mouseWarp(uv, u_warpIntensity);',

            '    float aspect = u_res.x / u_res.y;',
            '    float horizon = 0.35 + u_camElevation * 0.1;',

            // Camera yaw shifts scene horizontally (mouse-reactive)
            '    float yawOffset = u_camYaw * 0.05;',
            '    float xCam = uv.x + yawOffset;',
            '    vec2 camUV = vec2(xCam, uv.y);',

            // Sun position
            '    float sunH = u_sunHeight;',
            '    float sunX = mix(0.05, 0.95, (sunH + 0.5) / 1.5) + yawOffset * 0.3;',
            '    float sunY = horizon + sunH * 0.4;',
            '    vec2 sunPos = vec2(sunX, sunY);',

            // ---- RENDER LAYERS (back to front) ----',

            // Layer 1: Sky
            '    vec3 color = renderSky(camUV, sunH, u_skyTop, u_skyBottom, u_horizonGlow, sunPos);',

            // Layer 2: Moon
            '    float moon = renderMoon(camUV, sunH);',
            '    if (moon > 0.0) {',
            '        vec3 moonCol = vec3(0.85, 0.88, 0.95);',
            '        color += moonCol * moon * (1.0 - u_dayFactor * 0.5);',
            '    }',

            // Layer 3: Sun disk + glow
            '    float sun = renderSun(camUV, sunPos, sunH);',
            '    vec3 sunCol = vec3(1.0, 0.92, 0.72);',
            '    color += sunCol * sun * 0.6;',

            // Layer 4: Stars
            '    if (u_starDensity > 0.01) {',
            '        float stars = renderStars(camUV, horizon, u_starDensity);',
            '        vec3 starCol = vec3(0.88, 0.92, 1.0) * u_starBrightness;',
            '        color += starCol * stars;',
            '    }',

            // Layer 5: Clouds (above terrain)
            '    float clouds = renderClouds(camUV, horizon, u_time);',
            '    vec3 cloudCol = sunH > 0.0',
            '        ? mix(vec3(1.0), u_horizonGlow * 0.5, max(0.0, 1.0 - sunH * 2.0))',
            '        : vec3(0.3, 0.25, 0.35);',
            '    color = mix(color, cloudCol, clouds * 0.55);',

            // Layer 6: Terrain
            '    float terrain = renderTerrain(camUV, horizon, u_time);',
            '    if (terrain > 0.0) {',
            '        float heightFrac = terrain / 0.35;',
            '        vec3 landCol = mix(u_landFar, u_landNear, min(1.0, heightFrac * 2.0));',

            // Terrain texture
            '        float tex = snoise(vec2(camUV.x * 25.0, camUV.y * 12.0)) * 0.08;',
            '        landCol += tex;',

            // Cloud shadow
            '        float shadow = cloudShadow(camUV, horizon, u_time);',
            '        landCol *= 1.0 - shadow;',

            '        color = landCol;',
            '    }',

            // Layer 7: Water
            '    vec2 refUV = vec2(camUV.x, horizon * 2.0 - camUV.y);',
            '    vec3 waterResult = renderWater(camUV, refUV, horizon, u_time, terrain,',
            '        u_waterColor, u_skyTop, u_skyBottom, u_horizonGlow, sunPos, sunH);',
            '    if (waterResult.r >= 0.0) {',
            '        color = waterResult;',
            '    }',

            // Layer 8: Trees
            '    if (terrain > 0.0) {',
            '        float treeDensity = renderTrees(camUV, horizon, u_time, terrain);',
            '        vec3 treeCol = u_landNear * 0.65;',
            '        color = mix(color, treeCol, treeDensity);',
            '    }',

            // Layer 9: Particles
            '    float particles = renderParticles(camUV, horizon, u_time, u_dayFactor);',
            '    if (particles > 0.0) {',
            '        vec3 pCol = u_dayFactor < 0.35',
            '            ? vec3(0.7, 0.85, 0.3)  // fireflies — cool yellow-green',
            '            : vec3(1.0, 0.92, 0.75); // dust — warm white',
            '        color += pCol * particles;',
            '    }',

            // Layer 10: God rays
            '    if (u_godRayIntensity > 0.01) {',
            '        float rays = godRays(camUV, horizon, sunPos, u_godRayIntensity);',
            '        color += u_horizonGlow * rays;',
            '    }',

            // Layer 11: Fog
            '    float fogDist = abs(camUV.y - horizon) * 2.5;',
            '    float fog = exp(-fogDist * fogDist * 6.0) * u_fogDensity;',
            '    color = mix(color, u_fogColor, fog * 0.3);',

            // Layer 12: Light sweep (section transition)
            '    float sweep = lightSweep(uv, u_lightSweep);',
            '    color += vec3(1.0, 0.95, 0.8) * sweep;',

            // Color grading
            '    color = gradeColor(color, u_warmth, u_saturation, u_vignette, uv);',

            // Warmup fade-in
            '    color *= u_warmup;',

            '    fragColor = vec4(color, 1.0);',
            '}'
        ].join('\n');
    }

    // --- UNIFORM NAMES ---
    function getUniformNames() {
        return [
            'u_res', 'u_time', 'u_delta',
            'u_scroll', 'u_scrollSmooth', 'u_scrollVelocity',
            'u_mouse', 'u_camElevation', 'u_camFOV', 'u_camYaw',
            'u_mood', 'u_moodBlend', 'u_drsTier', 'u_warmup',
            'u_lightSweep',
            'u_sunAngle', 'u_sunHeight', 'u_dayFactor',
            'u_skyTop', 'u_skyBottom', 'u_horizonGlow',
            'u_landNear', 'u_landFar', 'u_waterColor',
            'u_fogColor', 'u_fogDensity',
            'u_starDensity', 'u_starBrightness',
            'u_warmth', 'u_saturation', 'u_vignette',
            'u_godRayIntensity', 'u_warpIntensity',
        ];
    }

    // --- UNIFORM COMPUTATION ---
    function setUniforms(gl, u, sceneState, time) {
        const mood = Math.min(MOODS.length - 1, sceneState.mood);
        const nextMood = Math.min(MOODS.length - 1, mood + 1);
        const blend = sceneState.moodBlend;

        const a = MOODS[mood];
        const b = MOODS[nextMood];

        function lerpVal(va, vb, t) { return va + (vb - va) * t; }
        function lerpVec(va, vb, t) {
            return [
                va[0] + (vb[0] - va[0]) * t,
                va[1] + (vb[1] - va[1]) * t,
                va[2] + (vb[2] - va[2]) * t,
            ];
        }

        const sunAngle = lerpVal(a.sunAngle, b.sunAngle, blend);
        const sunHeight = lerpVal(a.sunHeight, b.sunHeight, blend);
        const dayFactor = clamp01((sunHeight + 0.3) / 1.2);
        const skyTop = lerpVec(a.skyTop, b.skyTop, blend);
        const skyBottom = lerpVec(a.skyBottom, b.skyBottom, blend);
        const horizonGlow = lerpVec(a.horizonGlow, b.horizonGlow, blend);
        const landNear = lerpVec(a.landNear, b.landNear, blend);
        const landFar = lerpVec(a.landFar, b.landFar, blend);
        const waterColor = lerpVec(a.waterColor, b.waterColor, blend);
        const fogColor = lerpVec(a.fogColor, b.fogColor, blend);
        const fogDensity = lerpVal(a.fogDensity, b.fogDensity, blend);
        const starDensity = lerpVal(a.starDensity, b.starDensity, blend);
        const starBrightness = lerpVal(a.starBrightness, b.starBrightness, blend);
        const warmth = lerpVal(a.warmth, b.warmth, blend);
        const saturation = lerpVal(a.saturation, b.saturation, blend);
        const vignette = lerpVal(a.vignette, b.vignette, blend);
        const godRayIntensity = lerpVal(a.godRayIntensity, b.godRayIntensity, blend);
        const warpIntensity = lerpVal(a.warpIntensity, b.warpIntensity, blend);

        function set1f(name, val) { if (u[name]) gl.uniform1f(u[name], val); }
        function set3f(name, val) { if (u[name]) gl.uniform3f(u[name], val[0], val[1], val[2]); }
        function set1i(name, val) { if (u[name]) gl.uniform1i(u[name], val); }

        set1f('u_sunAngle', sunAngle);
        set1f('u_sunHeight', sunHeight);
        set1f('u_dayFactor', dayFactor);
        set3f('u_skyTop', skyTop);
        set3f('u_skyBottom', skyBottom);
        set3f('u_horizonGlow', horizonGlow);
        set3f('u_landNear', landNear);
        set3f('u_landFar', landFar);
        set3f('u_waterColor', waterColor);
        set3f('u_fogColor', fogColor);
        set1f('u_fogDensity', fogDensity);
        set1f('u_starDensity', starDensity);
        set1f('u_starBrightness', starBrightness);
        set1f('u_warmth', warmth);
        set1f('u_saturation', saturation);
        set1f('u_vignette', vignette);
        set1f('u_godRayIntensity', godRayIntensity);
        set1f('u_warpIntensity', warpIntensity);
    }

    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

    // --- EXPOSE ---
    window.MedPupNature = {
        getFragmentShaderSource: getFragmentShaderSource,
        getUniformNames: getUniformNames,
        setUniforms: setUniforms,
        MOODS: MOODS,
    };

})();
