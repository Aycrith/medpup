// ============================================================
// MedPup WebGL2 Water Horizon Scene — 3D Raymarched Shader v3
// Architecture: centered UV, 3D camera, water raymarching
// Matches rahatil.co's water horizon approach
// ============================================================
(function () {
    'use strict';

    // --- MOOD DEFINITIONS (v4 — cinematic rich palette) ---
    // Each mood represents a time of day with a distinct emotional temperature.
    // Colors are calibrated for richness, not raw brightness.
    // The envTint values are multiplied by shader multipliers (1.8 zenith, 1.5 horizon)
    // so total pre-tonemap values stay at reasonable levels.
    const MOODS = [
        { // 0: Night — deep indigo quiet
            name: 'night',
            waterColor: [0.02, 0.03, 0.08],
            envTint: [0.12, 0.14, 0.35],
            sunHeight: -0.4,
            nightFactor: 0.95,
            starDensity: 600, starBrightness: 0.65,
            camY: 0.5, camPitch: -0.02,
            warpIntensity: 0.3,
        },
        { // 1: Dawn — hope emerging, warm rose-purple
            name: 'dawn',
            waterColor: [0.06, 0.08, 0.18],
            envTint: [0.45, 0.22, 0.30],
            sunHeight: -0.1,
            nightFactor: 0.5,
            starDensity: 100, starBrightness: 0.18,
            camY: 0.52, camPitch: -0.01,
            warpIntensity: 0.5,
        },
        { // 2: Morning — crisp, fresh, productive
            name: 'morning',
            waterColor: [0.05, 0.08, 0.13],
            envTint: [0.40, 0.52, 0.42],
            sunHeight: 0.15,
            nightFactor: 0.0,
            starDensity: 0, starBrightness: 0,
            camY: 0.55, camPitch: -0.015,
            warpIntensity: 0.6,
        },
        { // 3: Midday — clean blue, direct, factual
            name: 'midday',
            waterColor: [0.07, 0.10, 0.15],
            envTint: [0.38, 0.48, 0.58],
            sunHeight: 0.7,
            nightFactor: 0.0,
            starDensity: 0, starBrightness: 0,
            camY: 0.58, camPitch: -0.01,
            warpIntensity: 0.7,
        },
        { // 4: Golden Hour — rich copper-amber warmth
            name: 'golden',
            waterColor: [0.10, 0.12, 0.08],
            envTint: [0.90, 0.38, 0.10],
            sunHeight: 0.1,
            nightFactor: 0.1,
            starDensity: 0, starBrightness: 0,
            camY: 0.53, camPitch: -0.015,
            warpIntensity: 0.5,
        },
        { // 5: Dusk — deep purple-magenta resolution
            name: 'dusk',
            waterColor: [0.04, 0.05, 0.09],
            envTint: [0.55, 0.22, 0.30],
            sunHeight: -0.25,
            nightFactor: 0.8,
            starDensity: 250, starBrightness: 0.40,
            camY: 0.48, camPitch: -0.02,
            warpIntensity: 0.35,
        },
    ];

    // --- FRAGMENT SHADER SOURCE (GLSL ES 3.0) v3 — 3D Raymarched Water Horizon ---
    function getFragmentShaderSource() {
        return [
            '#version 300 es',
            'precision highp float;',
            'out vec4 fragColor;',

            // Engine uniforms
            'uniform vec2  u_res;',
            'uniform float u_time;',
            'uniform float u_delta;',
            'uniform float u_scroll;',
            'uniform float u_scrollSmooth;',
            'uniform float u_scrollVelocity;',
            'uniform vec2  u_mouse;',
            'uniform float u_camElevation;',
            'uniform float u_camPitch;',
            'uniform float u_camFOV;',
            'uniform int   u_mood;',
            'uniform float u_moodBlend;',
            'uniform float u_drsTier;',
            'uniform float u_warmup;',
            'uniform float u_warpIntensity;',

            // Scene uniforms
            'uniform float u_starDensity;',
            'uniform float u_starBrightness;',
            'uniform float u_sunHeight;',
            'uniform float u_nightFactor;',
            'uniform float u_waveHeight;',
            'uniform float u_waveTime;',
            'uniform vec3  u_waterColor;',
            'uniform vec3  u_envTint;',

            // Boat wake trail uniforms
            'uniform float u_boatX;',
            'uniform float u_boatZ;',
            'uniform float u_wakeIntensity;',

            // ==========================================================',
            '// ---- NOISE ----',
            '// ==========================================================',

            'float hash(vec2 p) {',
            '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
            '}',

            'float hash21(vec2 p) {',
            '    p = fract(p * 0.3183099 + 0.1);',
            '    p *= 17.0;',
            '    return fract(p.x * p.y * (p.x + p.y));',
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
            '    int n = int(min(5.0, 6.0 - u_drsTier));',
            '    for (int i = 0; i < 6; i++) {',
            '        if (i >= n) break;',
            '        v += a * noise(p);',
            '        p = rot * p * 2.1;',
            '        a *= 0.48;',
            '    }',
            '    return v;',
            '}',

            // ==========================================================',
            '// ---- WATER HEIGHT FIELD ----',
            '// ==========================================================',

            'float GetWaterHeight(vec3 p, bool doMicro) {',
            '    float wh = u_waveHeight;',
            '    float t = u_waveTime;',
            '    vec2 pos = p.xz;',
            '    float h = 0.0;',

            // Main swell
            '    h += sin(pos.x * 0.8 + t * 0.6) * wh * 0.8;',
            '    h += sin(pos.x * 1.5 + pos.y * 0.7 + t * 1.1) * wh * 0.5;',
            '    h += sin(pos.x * 2.2 + pos.y * 1.4 + t * 1.7 + 1.0) * wh * 0.3;',

            '    // Micro detail (close-up waves)',
            '    if (doMicro) {',
            '        h += sin(pos.x * 5.0 + pos.y * 3.0 + t * 2.3) * wh * 0.12;',
            '        h += sin(pos.x * 11.0 + pos.y * 7.0 + t * 3.8) * wh * 0.06;',
            '        h += sin(pos.x * 23.0 + pos.y * 15.0 + t * 5.0 + 2.0) * wh * 0.03;',
            '    }',
            '',
            '    // Boat wake trail — foam displacement near boat position',
            '    if (u_wakeIntensity > 0.001) {',
            '        float wakeDist = length(p.xz - vec2(u_boatX, u_boatZ));',
            '        float wakeFalloff = exp(-wakeDist * 0.3) * u_wakeIntensity;',
            '        h += wakeFalloff * 0.08 * sin(wakeDist * 2.0 - t * 3.0);',
            '    }',
            '    return h;',
            '}',

            'vec3 GetNormal(vec3 p, bool doMicro, float d) {',
            '    float eps = doMicro ? 0.01 : 0.05;',
            '    float hL = GetWaterHeight(p + vec3(-eps, 0.0, 0.0), doMicro);',
            '    float hR = GetWaterHeight(p + vec3(eps, 0.0, 0.0), doMicro);',
            '    float hD = GetWaterHeight(p + vec3(0.0, 0.0, -eps), doMicro);',
            '    float hU = GetWaterHeight(p + vec3(0.0, 0.0, eps), doMicro);',
            '    vec3 n = normalize(vec3(hL - hR, 2.0 * eps, hD - hU));',
            '    return n;',
            '}',

            // ==========================================================',
            '// ---- SKY ----',
            '// ==========================================================',

            'vec3 GetSky(vec3 rd, vec3 zenith, vec3 horizon, vec3 horizonGlow, vec3 sunDir, float dayFactor, float nightFactor) {',
            '    vec3 col = mix(horizon, zenith, smoothstep(-0.2, 0.6, rd.y));',

            // Sunset glow
            '    float sunsetGlow = smoothstep(-0.15, 0.1, sunDir.y) * clamp(1.0 - smoothstep(-0.05, 0.4, sunDir.y), 0.0, 1.0);',
            '    float sunDot = max(0.0, dot(rd, sunDir));',
            '    col += horizonGlow * sunsetGlow * pow(clamp(sunDot, 0.0, 1.0), 1.5);',

            '    return col;',
            '}',

            // ==========================================================',
            '// ---- SUN ----',
            '// ==========================================================',

            'vec3 GetSun(vec3 rd, vec3 sunDir, float dayFactor, int moodId) {',
            '    float sunDot = max(0.0, dot(rd, sunDir));',
            '    if (sunDot < 0.998) return vec3(0.0);',

            // Core — sharp cutoff
            '    float core = smoothstep(0.9985, 0.9998, sunDot);',

            // Inner glow
            '    float innerGlow = pow(clamp(sunDot, 0.0, 1.0), 180.0);',

            // Outer glow
            '    float outerGlow = pow(clamp(sunDot, 0.0, 1.0), 12.0);',

            // Wide glow
            '    float wideGlow = pow(clamp(sunDot, 0.0, 1.0), 10.0);',

            // Mood-driven sun color
            '    float sunHeight = sunDir.y;',
            '    vec3 coreColor = mix(vec3(1.0, 0.7, 0.4), vec3(1.0, 0.98, 0.95), smoothstep(0.0, 0.3, sunHeight));',
            '    vec3 glowColor = mix(vec3(1.0, 0.25, 0.05), vec3(1.0, 0.8, 0.5), smoothstep(0.0, 0.4, sunHeight));',

            '    if (moodId == 0) {',
            '        coreColor = mix(vec3(1.0, 0.85, 0.7), vec3(1.0, 1.0, 1.0), smoothstep(0.0, 0.3, sunHeight));',
            '        glowColor = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.9, 0.75), smoothstep(0.0, 0.4, sunHeight));',
            '    }',

            '    vec3 result = coreColor * core * 0.9;',
            '    result += glowColor * innerGlow * 0.35;',
            '    result += mix(vec3(1.0, 0.06, 0.0), glowColor, 0.4) * outerGlow * 0.12;',
            '    result += glowColor * wideGlow * 0.025;',

            '    return result;',
            '}',

            // ==========================================================',
            '// ---- MOON ----',
            '// ==========================================================',

            'vec3 GetMoon(vec3 rd, vec3 moonDir, float nightFactor) {',
            '    float moonDot = max(0.0, dot(rd, moonDir));',
            '    if (moonDot < 0.998) return vec3(0.0);',

            // Crescent UV
            '    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), moonDir));',
            '    vec3 up = cross(moonDir, right);',
            '    vec2 uv = vec2(dot(rd, right), dot(rd, up)) * 45.0;',

            // Craters
            '    float craters = 0.5;',
            '    if (u_drsTier >= 2.5) {',
            '        craters = noise(uv * 8.0) * 0.6 + noise(uv * 20.0) * 0.4;',
            '    }',

            '    vec3 moonSurface = mix(vec3(0.5, 0.55, 0.6), vec3(1.0, 0.98, 0.95), craters);',
            '    float moonDist = clamp((1.0 - moonDot) / (1.0 - 0.9993), 0.0, 1.0);',
            '    float moonShape = smoothstep(0.9993, 0.99945, moonDot);',

            // Moon disk with spherical shading
            '    float disk = sqrt(1.0 - moonDist * moonDist) * moonShape;',
            '    vec3 col = moonSurface * disk * 1.5;',

            // Glow
            '    col += vec3(0.7, 0.85, 1.0) * pow(clamp(moonDot, 0.0, 1.0), 200.0) * 0.8;',
            '    col += vec3(0.7, 0.85, 1.0) * pow(clamp(moonDot, 0.0, 1.0), 70.0) * 0.35;',

            // Outer glow
            '    col += vec3(0.04, 0.05, 0.1) * pow(clamp(moonDot, 0.0, 1.0), 8.0) * 0.15;',
            '    col += vec3(0.04, 0.05, 0.1) * pow(clamp(moonDot, 0.0, 1.0), 25.0) * 0.08;',

            '    return col * nightFactor;',
            '}',

            // ==========================================================',
            '// ---- STARS ----',
            '// ==========================================================',

            'float GetStars(vec3 rd, float nightFactor, bool reflected) {',
            '    if (nightFactor < 0.05 || u_starDensity < 10.0) return 0.0;',
            '    float stars = 0.0;',

            // Spherical star field using rd
            '    float density = u_starDensity * 0.001;',
            '    vec2 starUV = vec2(atan(rd.z, rd.x) * 2.0, asin(rd.y)) * 80.0;',
            '    vec2 cell = floor(starUV);',
            '    vec2 cellUV = fract(starUV);',

            '    for (int dx = -1; dx <= 1; dx++) {',
            '        for (int dy = -1; dy <= 1; dy++) {',
            '            vec2 n = cell + vec2(float(dx), float(dy));',
            '            float h = hash21(n);',
            '            if (h < density) {',
            '                vec2 pos = vec2(hash21(n + 10.0), hash21(n + 20.0));',
            '                float d = distance(cellUV - vec2(float(dx), float(dy)), pos);',
            '                float mag = hash21(n + 30.0);',
            '                float size = 0.002 + mag * 0.015;',
            '                float twinkle = sin(u_time * (1.5 + mag * 3.0) + hash21(n + 40.0) * 6.28) * 0.5 + 0.5;',
            '                twinkle = pow(twinkle, 0.5 + mag * 2.0);',
            '                if (d < size) {',
            '                    float bright = (1.0 - d / size) * mag * twinkle * 1.5;',
            '                    stars = max(stars, bright);',
            '                }',
            '            }',
            '        }',
            '    }',
            '    return stars * nightFactor * u_starBrightness * 0.8;',
            '}',

            // ==========================================================',
            '// ---- CLOUDS ----',
            '// ==========================================================',

            'float getClouds(vec3 rd, float time, bool reflected) {',
            '    if (u_drsTier > 3.5 && reflected) return 0.0;',

            // Sample clouds at a 3D altitude
            '    float alt = 10.0 + abs(rd.y) * 15.0;',
            '    vec2 cloudUV = rd.xz * 0.3 / max(abs(rd.y) + 0.05, 0.01);',
            '    cloudUV += time * vec2(0.002, 0.001);',

            '    float c1 = fbm(cloudUV * 0.8);',
            '    float c2 = fbm(cloudUV * 1.5 + 100.0);',

            '    float cloud = smoothstep(0.42, 0.70, c1) * 0.45 + smoothstep(0.48, 0.76, c2) * 0.55;',
            '    return cloud * smoothstep(0.0, 0.3, abs(rd.y));',
            '}',

            'vec3 getCloudColor(vec3 rd, vec3 sunDir, vec3 tint) {',
            '    float sunDot = max(0.0, dot(normalize(vec3(rd.x, 0.0, rd.z)), sunDir));',
            '    vec3 base = vec3(0.7, 0.75, 0.85) * tint;',
            '    vec3 lit = vec3(0.9, 0.85, 0.8) * 1.0;',
            '    vec3 shaded = vec3(0.3, 0.35, 0.45) * tint;',
            '    return mix(shaded, lit, smoothstep(-0.2, 0.8, sunDot));',
            '}',

            // ==========================================================',
            '// ---- MOOD ----',
            '// ==========================================================',

            'vec3 getMoodTint() {',
            '    return u_envTint;',
            '}',

            // ==========================================================',
            '// ---- FILM COLOR GRADING ----',
            '// ==========================================================',
            '',
            '// Film S-curve — shadows crushed for depth, highlights rolled off for comfort',
            'float filmContrast(float x) {',
            '    return x * (x * (x * (x * 0.6 + 0.6) + 0.2) + 0.5);',
            '}',
            '',
            'vec3 gradeColor(vec3 col, vec2 uv) {',
            '    vec3 tint = getMoodTint();',
            '',
            '    // 1. Mood-driven white balance — subtle tint before tone mapping',
            '    float gray = dot(col, vec3(0.299, 0.587, 0.114));',
            '    col = mix(col, col * tint, 0.11);',
            '',
            '    // 2. Reinhard tone mapping — balanced: gentle shoulder, preserves midtones',
            '    col = (col * (1.8 * col + vec3(0.03))) / (col * (1.6 * col + vec3(0.6)) + vec3(0.12));',
            '',
            '    // 3. Shadow lift — film toe, deep but not crushed',
            '    col = col * 0.96 + 0.008;',
            '',
            '    // 4. Film S-curve contrast — cinematic shaping',
            '    col.r = filmContrast(col.r);',
            '    col.g = filmContrast(col.g);',
            '    col.b = filmContrast(col.b);',
            '',
            '    // 5. Saturation — rich but natural',
            '    gray = dot(col, vec3(0.299, 0.587, 0.114));',
            '    col = mix(vec3(gray), col, 0.78);',
            '',
            '    // 6. Gamma correction (sRGB display)',
            '    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));',
            '',
            '    // 7. Soft highlight ceiling — allows bright sun, prevents washout',
            '    col = min(col, vec3(0.88));',
            '',
            '    return max(vec3(0.0), col);',
            '}',

            // ==========================================================',
            '// ---- MAIN ----',
            '// ==========================================================',

            'void main() {',
            // Centered UV (matching rahatil.co approach)
            '    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;',
            '    float t = u_time * 0.3;',
            '',

            // Solar ease (interpolated warp for smooth sun movement)
            '    float warp = u_warpIntensity;',
            '    float solarEase = warp * warp * (3.0 - 2.0 * warp);',

            // Sun follows mouse WITH mood-driven offset
            // u_sunHeight from mood controls base position, mouse adds subtle offset
            '    float currentSunY = mix(0.15 + u_mouse.y * 1.0, 0.6, solarEase) + u_sunHeight;',
            '    vec3 sunDir = normalize(vec3(u_mouse.x * 0.15, currentSunY, 1.0));',
            '    vec3 moonDir = normalize(vec3(-u_mouse.x * 0.15, -currentSunY - 0.1, 1.0));',

            // Camera (3D position + direction)
            '    vec3 ro = vec3(',
            '        u_scroll * 4.0,',
            '        1.5 + solarEase * 3.0 + u_camElevation,',
            '        t * 2.0 + solarEase * 12.0 + (u_scroll + u_scrollVelocity) * 6.0',
            '    );',
            '    vec3 rd = normalize(vec3(',
            '        uv.x * u_camFOV,',
            '        uv.y - 0.1 + solarEase * 0.15 + u_camPitch,',
            '        1.1 + solarEase * 0.2',
            '    ));',

            // Day/night factor — mood-controlled via u_nightFactor
            '    float dayFactor = 1.0 - u_nightFactor;',
            '    float nightFactor = u_nightFactor;',
            '    float trueNight = smoothstep(0.3, 0.7, u_nightFactor);',

            // Environment tint from mood
            // NOTE: DO NOT use normalize() on colors — it treats them as direction vectors,
            // amplifying dominant channels and destroying natural ratios.
            // Simply clamp to prevent division by zero.
            '    vec3 envTint = max(u_envTint, vec3(0.0001));',
            '    vec3 moodTint = getMoodTint();',
            // Single tint pass — NOT envTint * moodTint (that squares the values)
            '    vec3 environmentTint = max(envTint, vec3(0.0001));',

            // Sky colors — balanced: visible color without blowout
            '    vec3 nightZenith = environmentTint * 0.02;',
            '    vec3 nightHorizon = environmentTint * 0.05;',
            '    vec3 dayZenith = environmentTint * 1.25;',
            '    vec3 dayHorizon = environmentTint * 0.80;',

            '    vec3 zenith = mix(nightZenith, dayZenith, dayFactor);',
            '    vec3 sunsetHorizon = mix(vec3(0.75, 0.2, 0.04), environmentTint, 0.90) * 0.72;',
            '    vec3 horizon = mix(nightHorizon, mix(sunsetHorizon, dayHorizon, smoothstep(0.0, 0.4, sunDir.y)), dayFactor);',

            // ---- RENDER ----',
            '    vec3 col = vec3(0.0);',

            // Sky sphere
            '    col = GetSky(rd, zenith, horizon, sunsetHorizon, sunDir, dayFactor, nightFactor);',

            // Atmospheric haze band at horizon — reduced intensity
            '    float hazeWidth = smoothstep(-0.12, 0.08, sunDir.y) * (1.0 - smoothstep(0.08, 0.3, sunDir.y));',
            '    float hazeDist = 1.0 - abs(uv.y - 0.045) * 3.0;',
            '    vec3 hazeColor = mix(vec3(0.9, 0.4, 0.15), vec3(0.6, 0.2, 0.3), smoothstep(-0.1, 0.2, sunDir.y));',
            '    float hazeAmount = max(0.0, hazeDist) * hazeWidth * 0.32;',
            '    col += hazeColor * hazeAmount;',

            // Nebula (night only)
            '    if (trueNight > 0.05 && u_drsTier > 1.5) {',
            '        vec2 nebUV = rd.xz / (abs(rd.y) + 0.001);',
            '        float neb = noise(nebUV * 2.0 + u_time * 0.01) * noise(nebUV * 4.0 - u_time * 0.01);',
            '        col += vec3(0.08, 0.03, 0.12) * envTint * neb * trueNight * smoothstep(0.0, 0.3, rd.y) * 1.0;',
            '    }',

            // Stars (on sphere, using ray direction)
            '    if (u_drsTier > 0.5) {',
            '        float stars = GetStars(rd, trueNight, false);',
            '        col += vec3(0.88, 0.92, 1.0) * stars * smoothstep(-0.1, 0.2, rd.y);',
            '    }',

            // Clouds (volumetric in 3D)
            '    if (u_drsTier > 0.5) {',
            '        float cloudAlpha = getClouds(rd, u_time, false);',
            '        if (cloudAlpha > 0.0) {',
            '            vec3 cloudCol = getCloudColor(rd, sunDir, envTint);',
            '            col = mix(col, cloudCol, cloudAlpha * 1.0);',
            '        }',
            '    }',

            // Sun/moon visibility masks — must be before use
            '    float sunMask = smoothstep(-0.05, 0.02, sunDir.y);',
            '    float moonMask = smoothstep(-0.05, 0.02, moonDir.y);',

            // Sun disk + glows
            '    vec3 sunCol = GetSun(rd, sunDir, dayFactor, u_mood);',
            '    col += sunCol * sunMask;',

            // God rays — reduced intensity
            '    float godRayIntensity = smoothstep(-0.05, 0.15, sunDir.y) * (1.0 - smoothstep(0.15, 0.4, sunDir.y));',
            '    if (godRayIntensity > 0.01 && dayFactor > 0.3) {',
            '        float sunDot2 = max(0.0, dot(rd, sunDir));',
            '        float rayBase = pow(clamp(sunDot2, 0.0, 1.0), 3.0);',
            '        float rayNoise = 0.5 + 0.5 * sin(rd.x * 3.0 + rd.y * 5.0 + u_time * 0.2);',
            '        col += sunsetHorizon * rayBase * godRayIntensity * 0.055 * rayNoise;',
            '    }',
            '',

            // Moon
            '    vec3 moonCol = GetMoon(rd, moonDir, trueNight);',
            '    col += moonCol * moonMask;',

            // ---- WATER (raymarched ground intersection) ----',
            '    if (rd.y < 0.0) {',
            // Ground plane intersection
            '        float d = -ro.y / min(rd.y, -0.0001);',
            '        if (d < 450.0) {',
            '            vec3 p = ro + rd * d;',

            // Height field offset
            '            bool doMicro = (d < 50.0);',
            '            float hOffset = GetWaterHeight(p, false);',
            '            p += rd * (hOffset / max(abs(rd.y), 0.05));',

            // Normals (smooth + sharp blend)
            '            vec3 N_smooth = GetNormal(p, false, d);',
            '            float horizonFlatten = smoothstep(40.0, 130.0, d);',
            '            N_smooth = normalize(mix(N_smooth, vec3(0.0, 1.0, 0.0), horizonFlatten));',
            '            vec3 N_sharp = N_smooth;',
            '            if (d < 80.0) {',
            '                N_sharp = GetNormal(p, true, d);',
            '            }',

            // Reflection of sky
            '            vec3 reflectedSky = GetSky(reflect(rd, N_smooth), zenith, horizon, sunsetHorizon, sunDir, dayFactor, nightFactor);',

            // Stars in reflection
            '            if (trueNight > 0.05 && u_drsTier > 0.5) {',
            '                vec3 refR = reflect(rd, N_smooth);',
            '                if (u_drsTier > 1.5) {',
            '                    vec2 nebUV2 = refR.xz / (abs(refR.y) + 0.001);',
            '                    float neb2 = noise(nebUV2 * 2.0) * trueNight;',
            '                    reflectedSky += vec3(0.04, 0.015, 0.06) * neb2 * smoothstep(0.0, 0.3, refR.y);',
            '                }',
            '                reflectedSky += vec3(0.88, 0.92, 1.0) * GetStars(refR, trueNight, true);',
            '            }',

            // Sky reflection in clouds
            '            if (u_drsTier > 1.5) {',
            '                vec3 refR2 = reflect(rd, N_smooth);',
            '                float refCloudAlpha = getClouds(refR2, u_time, true);',
            '                if (refCloudAlpha > 0.0) {',
            '                    reflectedSky = mix(reflectedSky, getCloudColor(refR2, sunDir, envTint), refCloudAlpha * 0.55);',
            '                }',
            '            }',

            // Fresnel
            '            float fresnel = pow(clamp(1.0 - max(0.0, dot(-rd, N_sharp)), 0.0, 1.0), 5.0);',

            // Water color with wave-local variation — boosted saturation
            '    float waveLocalH = GetWaterHeight(p, false);',
            '    vec3 tidalColor = mix(u_waterColor * 0.4, u_waterColor * 2.4, smoothstep(-u_waveHeight * 1.5, u_waveHeight * 2.0, waveLocalH)) * moodTint;',

            // Night water
            '            vec3 nightWater = mix(envTint * 0.004 + tidalColor * 0.08, envTint * 0.025 + tidalColor * 0.30, max(0.0, moonDir.y));',
            '            vec3 waterBase = mix(nightWater, tidalColor, dayFactor);',
            '            waterBase *= 1.0 + 0.25 * smoothstep(0.0, 20.0, d);',

            // Final water color = base + reflected sky via Fresnel
            '            vec3 waterCol = mix(waterBase, reflectedSky * 0.85, 0.06 + 0.78 * fresnel);',

            // Sun specular highlight
            '            float specPower = (u_drsTier > 0.5) ? 400.0 : 220.0;',
            '            float specDot = max(0.0, dot(N_smooth, normalize(-rd + sunDir)));',
            '            float specDistFade = 1.0 - smoothstep(30.0, 120.0, d);',
            '            float specTerm = pow(clamp(specDot, 0.0, 1.0), specPower) * 0.8 * specDistFade;',
            '            specTerm += pow(clamp(specDot, 0.0, 1.0), 80.0) * 0.4 * specDistFade;',
            '            vec3 specColor = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.9, 0.7), smoothstep(0.0, 0.3, sunDir.y));',
            '            waterCol += specColor * specTerm * sunMask;',

            // Micro-glints (mood 0: sharp diamond highlights)
            '            if (u_mood == 0) {',
            '                float glints = pow(clamp(dot(N_sharp, normalize(-rd + sunDir)), 0.0, 1.0), 1200.0) * 8.0 * specDistFade;',
            '                waterCol += vec3(1.0, 0.98, 0.92) * glints * sunMask;',
            '            }',

            // Moon specular
            '            float moonSpecDot = max(0.0, dot(N_smooth, normalize(-rd + moonDir)));',
            '            float moonSpec = pow(clamp(moonSpecDot, 0.0, 1.0), specPower + 100.0) * 2.5 * specDistFade;',
            '            waterCol += vec3(0.5, 0.65, 0.85) * moonSpec * trueNight * moonMask;',

            // Moon diffuse
            '            float diffuseMoon = max(0.0, dot(N_smooth, moonDir));',
            '            waterCol += (vec3(0.02, 0.028, 0.05) + tidalColor * 0.15) * (diffuseMoon * 0.4) * trueNight;',

            // Distance fog
            '            float fogFactor = smoothstep(50.0, 420.0, d);',
            '            waterCol = mix(waterCol, horizon, fogFactor * 0.25);',

            // Blend water into scene
            '            col = mix(waterCol, col, smoothstep(120.0, 448.0, d));',
            '        }',
            '    }',

            // Film color grading (includes tint, tone mapping, S-curve, saturation, gamma, vignette)
            '    col = gradeColor(col, uv);',

            // Warmup fade
            '    col *= u_warmup;',

            '    fragColor = vec4(col, 1.0);',
            '}'
        ].join('\n');
    }

    // --- UNIFORM NAMES ---
    function getUniformNames() {
        return [
            'u_res', 'u_time', 'u_delta',
            'u_scroll', 'u_scrollSmooth', 'u_scrollVelocity',
            'u_mouse', 'u_camElevation', 'u_camPitch', 'u_camFOV',
            'u_mood', 'u_moodBlend', 'u_drsTier', 'u_warmup',
            'u_warpIntensity',
            'u_starDensity', 'u_starBrightness',
            'u_sunHeight', 'u_nightFactor',
            'u_waveHeight', 'u_waveTime',
            'u_waterColor', 'u_envTint',
            'u_boatX', 'u_boatZ', 'u_wakeIntensity',
        ];
    }

    // --- BOAT POSITION STATE (set by cinematic-env.js) ---
    var boatState = { x: -999, z: -999, wakeIntensity: 0 };

    // --- UNIFORM COMPUTATION ---
    function setUniforms(gl, u, sceneState, time) {
        const mood = Math.min(MOODS.length - 1, sceneState.mood);
        const nextMood = Math.min(MOODS.length - 1, mood + 1);
        const blend = sceneState.moodBlend;

        const a = MOODS[mood];
        const b = MOODS[nextMood];

        function lerp(va, vb, t) { return va + (vb - va) * t; }
        function lerpVec(va, vb, t) {
            return [
                va[0] + (vb[0] - va[0]) * t,
                va[1] + (vb[1] - va[1]) * t,
                va[2] + (vb[2] - va[2]) * t,
            ];
        }

        const waterColor = lerpVec(a.waterColor, b.waterColor, blend);
        const envTint = lerpVec(a.envTint, b.envTint, blend);
        const starDensity = lerp(a.starDensity, b.starDensity, blend);
        const sunHeight = lerp(a.sunHeight || 0, b.sunHeight || 0, blend);
        const nightFactor = lerp(a.nightFactor || 0, b.nightFactor || 0, blend);

        function set1f(name, val) { if (u[name]) gl.uniform1f(u[name], val); }
        function set3f(name, val) { if (u[name]) gl.uniform3f(u[name], val[0], val[1], val[2]); }
        function set1i(name, val) { if (u[name]) gl.uniform1i(u[name], val); }

        set3f('u_waterColor', waterColor);
        set3f('u_envTint', envTint);
        set1f('u_starDensity', starDensity);
        set1f('u_starBrightness', lerp(a.starBrightness || 0, b.starBrightness || 0, blend));
        set1f('u_sunHeight', sunHeight);
        set1f('u_nightFactor', nightFactor);
        set1f('u_waveHeight', 0.1);
        set1f('u_waveTime', time * 2.0);

        // Boat wake trail uniforms
        set1f('u_boatX', boatState.x);
        set1f('u_boatZ', boatState.z);
        set1f('u_wakeIntensity', boatState.wakeIntensity);
    }

    // --- EXPOSE ---
    window.MedPupNature = {
        getFragmentShaderSource: getFragmentShaderSource,
        getUniformNames: getUniformNames,
        setUniforms: setUniforms,
        setBoatPosition: function (x, z) {
            boatState.x = x;
            boatState.z = z;
            // Wake intensity decays over time but refreshes when boat moves
            boatState.wakeIntensity = Math.min(1.0, boatState.wakeIntensity * 0.95 + 0.15);
        },
        MOODS: MOODS,
    };

})();
