// ============================================================
// MedPup WebGL2 Nature Scene — Shaders + Mood Configuration
// Procedural nature landscape with day/night cycle
// ============================================================
(function () {
    'use strict';

    // --- MOOD DEFINITIONS ---
    // Each mood defines the visual atmosphere for a website section
    const MOODS = [
        { // 0: Night — Hero (The Problem)
            name: 'night',
            sunAngle: -0.35, sunHeight: -0.3,
            skyTop: [0.02, 0.02, 0.12],
            skyBottom: [0.05, 0.05, 0.20],
            horizonGlow: [0.08, 0.06, 0.18],
            landNear: [0.04, 0.08, 0.03],
            landFar: [0.02, 0.04, 0.02],
            waterColor: [0.01, 0.03, 0.06],
            fogColor: [0.02, 0.02, 0.10],
            fogDensity: 0.3,
            starDensity: 1.0,
            starBrightness: 1.0,
            warmup: 0.7,
            saturation: 0.6,
            vignette: 0.4,
        },
        { // 1: Dawn — Intro
            sunAngle: 0.0, sunHeight: 0.0,
            skyTop: [0.15, 0.10, 0.30],
            skyBottom: [0.80, 0.50, 0.30],
            horizonGlow: [1.0, 0.6, 0.3],
            landNear: [0.15, 0.20, 0.08],
            landFar: [0.25, 0.15, 0.10],
            waterColor: [0.60, 0.40, 0.20],
            fogColor: [0.70, 0.50, 0.35],
            fogDensity: 0.5,
            starDensity: 0.3,
            starBrightness: 0.4,
            warmup: 1.0,
            saturation: 0.9,
            vignette: 0.25,
        },
        { // 2: Morning — How It Works
            sunAngle: 0.4, sunHeight: 0.3,
            skyTop: [0.20, 0.35, 0.60],
            skyBottom: [0.50, 0.65, 0.75],
            horizonGlow: [0.80, 0.70, 0.50],
            landNear: [0.20, 0.35, 0.12],
            landFar: [0.25, 0.35, 0.18],
            waterColor: [0.20, 0.50, 0.55],
            fogColor: [0.60, 0.65, 0.70],
            fogDensity: 0.2,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmup: 1.0,
            saturation: 1.1,
            vignette: 0.1,
        },
        { // 3: Midday — Calculator (Transparency)
            sunAngle: 1.2, sunHeight: 0.8,
            skyTop: [0.15, 0.40, 0.70],
            skyBottom: [0.40, 0.70, 0.80],
            horizonGlow: [0.60, 0.75, 0.80],
            landNear: [0.25, 0.40, 0.10],
            landFar: [0.30, 0.45, 0.20],
            waterColor: [0.15, 0.55, 0.60],
            fogColor: [0.50, 0.65, 0.70],
            fogDensity: 0.1,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmup: 1.0,
            saturation: 1.2,
            vignette: 0.05,
        },
        { // 4: Golden Hour — Clinics (Trust)
            sunAngle: 1.8, sunHeight: 0.2,
            skyTop: [0.30, 0.20, 0.45],
            skyBottom: [0.90, 0.55, 0.25],
            horizonGlow: [1.0, 0.55, 0.15],
            landNear: [0.35, 0.30, 0.08],
            landFar: [0.40, 0.25, 0.12],
            waterColor: [0.70, 0.45, 0.15],
            fogColor: [0.80, 0.55, 0.30],
            fogDensity: 0.25,
            starDensity: 0.0,
            starBrightness: 0.0,
            warmup: 1.0,
            saturation: 1.0,
            vignette: 0.15,
        },
        { // 5: Dusk — CTA/Trust (Resolution)
            sunAngle: 2.3, sunHeight: -0.15,
            skyTop: [0.05, 0.02, 0.15],
            skyBottom: [0.40, 0.15, 0.25],
            horizonGlow: [0.60, 0.25, 0.20],
            landNear: [0.06, 0.05, 0.03],
            landFar: [0.08, 0.04, 0.04],
            waterColor: [0.10, 0.05, 0.10],
            fogColor: [0.20, 0.10, 0.15],
            fogDensity: 0.35,
            starDensity: 0.6,
            starBrightness: 0.6,
            warmup: 1.0,
            saturation: 0.8,
            vignette: 0.3,
        },
    ];

    // --- FRAGMENT SHADER SOURCE (GLSL ES 3.0) ---
    // Generates the complete nature scene procedurally
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
            'uniform int   u_mood;',
            'uniform float u_moodBlend;',
            'uniform float u_drsTier;',
            'uniform float u_warmup;',

            // Scene uniforms (set by scene module)
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

            // ---- UTILITY FUNCTIONS ----',
            '',
            'float hash(vec2 p) {',
            '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
            '}',

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

            'float fbm(vec2 p) {',
            '    float v = 0.0;',
            '    float a = 0.5;',
            '    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));',
            '    int octs = int(min(6.0, 7.0 - u_drsTier * 2.0));',
            '    for (int i = 0; i < 6; i++) {',
            '        if (i >= octs) break;',
            '        v += a * noise(p);',
            '        p = rot * p * 2.0;',
            '        a *= 0.5;',
            '    }',
            '    return v;',
            '}',

            'float sunDisk(vec2 uv, vec2 sunPos, float radius) {',
            '    float d = distance(uv, sunPos);',
            '    return 1.0 - smoothstep(radius * 0.8, radius * 1.2, d);',
            '}',

            'float sunGlow(vec2 uv, vec2 sunPos, float radius) {',
            '    float d = distance(uv, sunPos);',
            '    return exp(-d * d * 40.0 * radius);',
            '}',

            // Terrain height at a given x position
            'float terrainHeight(float x, float time, float detail) {',
            '    float h = 0.0;',
            '    int lyrs = int(min(5.0, 5.0 - u_drsTier));',
            '    float amp = 0.15;',
            '    float freq = 1.0;',
            '    for (int i = 0; i < 5; i++) {',
            '        if (i >= lyrs) break;',
            '        float layer = float(i);',
            '        float n = noise(vec2(x * freq + layer * 10.0, layer));',
            '        h += (n - 0.3) * amp;',
            '        freq *= 2.1 + sin(time * 0.1 + layer) * 0.2;',
            '        amp *= 0.55;',
            '    }',
            '    return h + detail * 0.05;',
            '}',

            'vec3 renderSky(vec2 uv, float sunH, vec3 top, vec3 bot, vec3 glow, vec2 sunPos) {',
            '    float horizon = 0.35 + u_camElevation * 0.1;',
            '    float heightFrac = (uv.y - horizon) / (1.0 - horizon);',
            '    vec3 sky = mix(bot, top, max(0.0, heightFrac));',

            // Horizon glow
            '    float distHorizon = 1.0 - abs(uv.y - horizon) * 8.0;',
            '    distHorizon = max(0.0, distHorizon);',
            '    sky += glow * distHorizon * distHorizon * 0.5;',

            // Sun glow at low angles
            '    if (sunH < 0.3 && sunH > -0.2) {',
            '        float sunGlowIntensity = sunGlow(uv, sunPos, 0.4);',
            '        sky += glow * sunGlowIntensity * 0.3 * (1.0 - abs(sunH) * 3.0);',
            '    }',

            '    return sky;',
            '}',

            'float renderStars(vec2 uv, float horizon, float density) {',
            '    if (density < 0.01) return 0.0;',
            '    vec2 starUV = vec2(uv.x * 2.0, (1.0 - uv.y) * 4.0);',
            '    float stars = 0.0;',
            '    vec2 gridRes = vec2(300.0, 150.0);',

            '    vec2 cell = floor(starUV * gridRes);',
            '    vec2 cellUV = fract(starUV * gridRes);',
            '    float cellHash = hash(cell);',
            '    float starChance = density * 0.8;',
            '    if (cellHash < starChance) {',
            '        vec2 starPos = vec2(hash(cell + 10.0), hash(cell + 20.0));',
            '        float dist = distance(cellUV, starPos);',
            '        float twinkle = sin(u_time * (2.0 + hash(cell + 30.0) * 3.0) + hash(cell + 40.0) * 6.28) * 0.5 + 0.5;',
            '        float size = 0.004 + hash(cell + 50.0) * 0.008;',
            '        if (dist < size) {',
            '            stars = (1.0 - dist / size) * twinkle;',
            '        }',
            '    }',
            '    return stars;',
            '}',

            'float renderClouds(vec2 uv, float horizon, float time) {',
            '    float cloudUVy = (uv.y - horizon) / (1.0 - horizon);',
            '    if (cloudUVy < 0.0 || cloudUVy > 1.0) return 0.0;',

            // Layer 1: High thin clouds
            '    vec2 p1 = vec2(uv.x * 0.8 + time * 0.005, cloudUVy * 0.5 + time * 0.002);',
            '    float c1 = fbm(p1);',
            '    c1 = smoothstep(0.45, 0.75, c1);',

            // Layer 2: Lower puffy clouds
            '    vec2 p2 = vec2(uv.x * 1.5 + time * 0.008 + 100.0, cloudUVy * 0.8 + time * 0.003 + 50.0);',
            '    float c2 = fbm(p2);',
            '    c2 = smoothstep(0.5, 0.8, c2);',

            '    return max(c1 * 0.4, c2 * 0.6);',
            '}',

            'float renderTerrain(vec2 uv, float horizon, float time) {',
            '    float aspect = u_res.x / u_res.y;',
            '    float x = (uv.x - 0.5) * aspect * 3.0;',
            '    float detail = fbm(vec2(x * 5.0 + time * 0.02, 0.0));',

            '    float h = terrainHeight(x, time, detail) + 0.15;',
            '    float yOffset = u_camElevation * 0.15;',
            '    float terrainY = horizon + h + yOffset;',

            '    if (uv.y < terrainY) return terrainY - uv.y;',
            '    return -1.0;',
            '}',

            'float renderWater(vec2 uv, float horizon, float time, float terrainH) {',
            '    if (terrainH < 0.0) return -1.0;',
            '    float waterBase = horizon + 0.02 + u_camElevation * 0.1;',
            '    float wave = sin(uv.x * 12.0 + time * 0.8) * 0.005',
            '              + sin(uv.x * 25.0 + time * 1.2 + 2.0) * 0.003;',
            '    float waterY = waterBase + wave;',
            '    if (uv.y < waterY && uv.y < horizon + terrainH) {',
            '        return waterY - uv.y;',
            '    }',
            '    return -1.0;',
            '}',

            'float renderTrees(vec2 uv, float horizon, float time, float terrainH) {',
            '    if (terrainH < 0.01) return 0.0;',
            '    float aspect = u_res.x / u_res.y;',
            '    float x = (uv.x - 0.5) * aspect * 3.0;',
            '    float trees = 0.0;',

            '    int count = int(min(25.0, 20.0 + 10.0 * (1.0 - u_drsTier * 0.2)));',
            '    for (int i = 0; i < 25; i++) {',
            '        if (i >= count) break;',
            '        float fi = float(i);',
            '        float tx = hash(vec2(fi, 0.0)) * 4.0 - 2.0;',
            '        float th = 0.05 + hash(vec2(fi, 10.0)) * 0.15;',
            '        float tw = 0.01 + hash(vec2(fi, 20.0)) * 0.015;',
            '        float sway = sin(time * 0.5 + fi) * 0.002;',

            '        float distX = abs(x - tx - sway);',
            '        if (distX < tw && uv.y < horizon + terrainH && uv.y > horizon + terrainH - th) {',
            '            float treeShape = 1.0 - distX / tw;',
            '            float heightFrac = (horizon + terrainH - uv.y) / th;',
            '            treeShape *= 1.0 - heightFrac * heightFrac;',
            '            trees = max(trees, treeShape * 0.6);',
            '        }',
            '    }',
            '    return trees;',
            '}',

            'float renderParticles(vec2 uv, float horizon, float time, float dayFactor) {',
            '    int count = int(min(25.0, 20.0 + 20.0 * (1.0 - u_drsTier * 0.25)));',
            '    float result = 0.0;',

            '    for (int i = 0; i < 25; i++) {',
            '        if (i >= count) break;',
            '        float fi = float(i);',
            '        vec2 pos = vec2(',
            '            hash(vec2(fi, 100.0)) * 1.4 - 0.2,',
            '            horizon + 0.1 + hash(vec2(fi, 200.0)) * 0.6',
            '        );',

            // Drift
            '        pos.x += sin(time * 0.3 + fi * 2.0) * 0.08;',
            '        pos.y += sin(time * 0.5 + fi * 3.0 + 1.0) * 0.04;',

            // Fireflies at night, dust motes during day
            '        float size = dayFactor < 0.3 ? 0.004 : 0.002;',
            '        float brightness = dayFactor < 0.3 ? 0.8 : 0.2;',
            '        float pulse = sin(time * 2.0 + fi * 5.0) * 0.5 + 0.5;',

            '        float dist = distance(uv, pos);',
            '        if (dist < size) {',
            '            result = max(result, brightness * (1.0 - dist / size) * (dayFactor < 0.3 ? pulse : 1.0));',
            '        }',
            '    }',
            '    return result;',
            '}',

            // Color grading
            'vec3 gradeColor(vec3 color, float warmth, float sat, float vig, vec2 uv) {',
            // Warmth
            '    color *= vec3(warmth, 1.0, 1.0 - (warmth - 1.0) * 0.5);',

            // Saturation
            '    float gray = dot(color, vec3(0.299, 0.587, 0.114));',
            '    color = mix(vec3(gray), color, sat);',

            // Vignette
            '    vec2 vigUV = (uv - 0.5) * 1.2;',
            '    float vigAmount = 1.0 - dot(vigUV, vigUV) * vig;',
            '    color *= max(0.0, vigAmount);',

            '    return max(vec3(0.0), color);',
            '}',

            'void main() {',
            '    vec2 uv = gl_FragCoord.xy / u_res;',
            '    float aspect = u_res.x / u_res.y;',
            '    float horizon = 0.35 + u_camElevation * 0.1;',

            // Sun position
            '    float sunH = u_sunHeight;',
            '    float sunX = mix(0.1, 0.9, (sunH + 0.5) / 1.5);',
            '    float sunY = horizon + sunH * 0.4;',
            '    vec2 sunPos = vec2(sunX, sunY);',

            // ---- RENDER LAYERS (back to front) ----',

            // Layer 1: Sky
            '    vec3 color = renderSky(uv, sunH, u_skyTop, u_skyBottom, u_horizonGlow, sunPos);',

            // Layer 2: Sun disk
            '    if (sunH > -0.15) {',
            '        float sd = sunDisk(uv, sunPos, 0.025);',
            '        float sg = sunGlow(uv, sunPos, 0.15);',
            '        vec3 sunCol = vec3(1.0, 0.9, 0.7);',
            '        color += sunCol * sd * 0.8;',
            '        color += u_horizonGlow * sg * 0.15;',
            '    }',

            // Layer 3: Stars (only visible when sun is low)
            '    if (u_starDensity > 0.01) {',
            '        float stars = renderStars(uv, horizon, u_starDensity);',
            '        vec3 starCol = vec3(0.9, 0.95, 1.0) * u_starBrightness;',
            '        color += starCol * stars;',
            '    }',

            // Layer 4: Clouds
            '    float clouds = renderClouds(uv, horizon, u_time);',
            '    color = mix(color, vec3(1.0), clouds * 0.6);',

            // Layer 5: Terrain
            '    float terrain = renderTerrain(uv, horizon, u_time);',
            '    if (terrain > 0.0) {',
            '        float heightFrac = terrain / 0.3;',
            '        vec3 landCol = mix(u_landFar, u_landNear, min(1.0, heightFrac * 2.0));',
            // Add some texture variation
            '        float tex = noise(vec2(uv.x * 20.0, uv.y * 10.0)) * 0.1;',
            '        landCol += tex;',
            '        color = landCol;',
            '    }',

            // Layer 6: Water
            '    float water = renderWater(uv, horizon, u_time, terrain);',
            '    if (water > 0.0) {',
            // Reflect sky
            '        vec2 reflectUV = vec2(uv.x, horizon * 2.0 - uv.y);',
            '        vec3 reflected = renderSky(reflectUV, sunH, u_skyTop, u_skyBottom, u_horizonGlow, sunPos);',
            '        color = mix(u_waterColor, reflected, 0.3);',
            // Specular highlight
            '        float spec = pow(max(0.0, sin(uv.x * 30.0 + u_time * 0.8)), 8.0);',
            '        color += vec3(1.0, 0.95, 0.8) * spec * 0.15;',
            '    }',

            // Layer 7: Trees
            '    if (terrain > 0.0) {',
            '        float treeDensity = renderTrees(uv, horizon, u_time, terrain);',
            '        vec3 treeCol = u_landNear * 0.7;',
            '        color = mix(color, treeCol, treeDensity);',
            '    }',

            // Layer 8: Particles (fireflies/dust)
            '    float particles = renderParticles(uv, horizon, u_time, u_dayFactor);',
            '    if (particles > 0.0) {',
            '        vec3 pCol = u_dayFactor < 0.3',
            '            ? vec3(0.8, 0.9, 0.4)  // fireflies - warm yellow-green',
            '            : vec3(1.0, 0.95, 0.8); // dust motes - warm white',
            '        color += pCol * particles;',
            '    }',

            // Layer 9: Fog
            '    float fogDist = abs(uv.y - horizon) * 2.0;',
            '    float fog = exp(-fogDist * fogDist * 8.0) * u_fogDensity;',
            '    color = mix(color, u_fogColor, fog * 0.4);',

            // Color grading
            '    color = gradeColor(color, u_warmth, u_saturation, u_vignette, uv);',

            // Warmup fade-in
            '    color *= u_warmup;',

            '    fragColor = vec4(color, 1.0);',
            '}'
        ].join('\n');
    }

    // --- UNIFORM NAMES (for engine to register) ---
    function getUniformNames() {
        return [
            'u_res', 'u_time', 'u_delta',
            'u_scroll', 'u_scrollSmooth', 'u_scrollVelocity',
            'u_mouse', 'u_camElevation',
            'u_mood', 'u_moodBlend', 'u_drsTier', 'u_warmup',
            'u_sunAngle', 'u_sunHeight', 'u_dayFactor',
            'u_skyTop', 'u_skyBottom', 'u_horizonGlow',
            'u_landNear', 'u_landFar', 'u_waterColor',
            'u_fogColor', 'u_fogDensity',
            'u_starDensity', 'u_starBrightness',
            'u_warmth', 'u_saturation', 'u_vignette',
        ];
    }

    // --- UNIFORM COMPUTATION (called each frame by engine) ---
    function setUniforms(gl, u, sceneState, time) {
        const mood = Math.min(MOODS.length - 1, sceneState.mood);
        const nextMood = Math.min(MOODS.length - 1, mood + 1);
        const blend = sceneState.moodBlend;

        // Interpolate between current and next mood
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
        const warmth = lerpVal(0.9 + (1.0 - dayFactor) * 0.4, 0.9 + (1.0 - dayFactor) * 0.4, blend);
        const saturation = lerpVal(a.saturation, b.saturation, blend);
        const vignette = lerpVal(a.vignette, b.vignette, blend);

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
