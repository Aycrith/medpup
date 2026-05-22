// ============================================================
// MedPup WebGL2 Cinematic Engine — Core Rendering Pipeline v2
// GPU benchmark preflight, adaptive DRS, frame-time monitoring
// ============================================================
(function () {
    'use strict';

    // --- MODULE STATE ---
    const state = {
        canvas: null,
        gl: null,
        program: null,
        uLocs: {},
        animFrameId: null,
        running: false,
        drsTier: 0,
        canvasScale: 1.0,
        frameCount: 0,
        lastFrameTime: 0,
        fps: 60,

        // Adaptive quality
        benchmarkComplete: false,
        gpuScore: 0,
        frameTimes: [],
        frameTimeIndex: 0,
        adaptiveDownscale: false,

        // Light sweep (section transitions)
        lightSweep: 0,
        lightSweepActive: false,
        lightSweepTime: 0,
    };

    const FRAME_TIME_SAMPLE_SIZE = 30;
    const TARGET_FRAME_TIME_MS = 16; // ~60fps
    const ADAPTIVE_DOWNSCALE_FACTOR = 0.75;

    // --- PUBLIC API ---
    window.MedPupWebGL = {

        init: function (canvasId) {
            if (state.running) return;
            state.canvas = document.getElementById(canvasId || 'v');
            if (!state.canvas) { console.warn('[WebGL] Canvas not found'); return; }

            // WebGL2 context
            state.gl = state.canvas.getContext('webgl2', {
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
                depth: false,
            });
            if (!state.gl) {
                console.warn('[WebGL] WebGL2 not supported — fallback');
                this._fallback();
                return;
            }

            // Initial DRS based on device heuristics
            state.drsTier = this._detectDRSTier();
            this._resize();

            // Compile shaders
            if (!window.MedPupNature || !this._initShaders()) {
                console.warn('[WebGL] Shader compilation failed — fallback');
                this._fallback();
                return;
            }

            // Full-screen quad
            this._initGeometry();

            // GPU benchmark (non-blocking, runs warmup frames)
            this._startBenchmark(function (score) {
                state.benchmarkComplete = true;
                state.gpuScore = score;
                // Adjust DRS based on measured performance
                if (score < 30) {
                    state.drsTier = Math.min(state.drsTier + 1, 4);
                    this._resize();
                    console.log('[WebGL] GPU benchmark: ' + score + 'fps — adjusted to tier ' + state.drsTier);
                } else {
                    console.log('[WebGL] GPU benchmark: ' + score + 'fps — tier ' + state.drsTier + ' OK');
                }
            }.bind(this));

            // Events
            window.addEventListener('resize', this._resize.bind(this), { passive: true });
            window.addEventListener('orientationchange', this._resize.bind(this), { passive: true });

            // Start loop
            state.running = true;
            state.lastFrameTime = performance.now();
            state.frameTimes = new Float32Array(FRAME_TIME_SAMPLE_SIZE);
            this._loop(state.lastFrameTime);

            console.log('[WebGL] Engine v2 initialized (initial tier ' + state.drsTier + ')');
        },

        destroy: function () {
            state.running = false;
            if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
            if (state.gl) {
                const gl = state.gl;
                gl.useProgram(null);
                if (state.program) gl.deleteProgram(state.program);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            state.gl = null;
        },

        /** Trigger a light sweep for section transitions */
        triggerLightSweep: function () {
            state.lightSweep = 0.01;
            state.lightSweepActive = true;
            state.lightSweepTime = 0;
        },

        // --- INTERNAL ---

        _detectDRSTier: function () {
            const ua = navigator.userAgent;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            if (isMobile && window.innerWidth < 768) return 4;
            if (isMobile) return 3;
            if (window.innerWidth < 1024) return 2;
            // Check for low-end GPU via WebGL renderer hint
            const gl = state.gl;
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                    if (/intel (hd|uhd|iris) (4|5|6)\d{2}/.test(renderer) ||
                        /swiftshader|llvmpipe|mali-4\d{2}|adreno (3|4)\d{2}/.test(renderer)) {
                        return 1; // Lower desktop tier for integrated/low-end GPU
                    }
                }
            }
            return 0;
        },

        _resize: function () {
            let scale = [1.0, 1.0, 0.8, 0.6, 0.5][state.drsTier];
            if (state.adaptiveDownscale) scale *= ADAPTIVE_DOWNSCALE_FACTOR;

            const dpr = window.devicePixelRatio || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;

            state.canvasScale = scale;
            state.canvas.width = Math.round(w * dpr * scale);
            state.canvas.height = Math.round(h * dpr * scale);
            state.canvas.style.width = w + 'px';
            state.canvas.style.height = h + 'px';

            if (state.gl) {
                state.gl.viewport(0, 0, state.canvas.width, state.canvas.height);
            }
        },

        _initShaders: function () {
            const gl = state.gl;
            const scene = window.MedPupNature;
            if (!scene) return false;

            const vsSrc = [
                '#version 300 es',
                'in vec2 a_position;',
                'void main() {',
                '    gl_Position = vec4(a_position, 0.0, 1.0);',
                '}'
            ].join('\n');

            const fsSrc = scene.getFragmentShaderSource();

            const vs = this._compileShader(gl.VERTEX_SHADER, vsSrc);
            const fs = this._compileShader(gl.FRAGMENT_SHADER, fsSrc);
            if (!vs || !fs) return false;

            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);

            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('[WebGL] Program link error:', gl.getProgramInfoLog(prog));
                return false;
            }

            state.program = prog;
            gl.useProgram(prog);
            this._getUniforms(scene.getUniformNames());

            return true;
        },

        _compileShader: function (type, src) {
            const gl = state.gl;
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const log = gl.getShaderInfoLog(shader);
                const label = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
                console.error('[WebGL] ' + label + ' shader compile error:', log);
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        },

        _getUniforms: function (names) {
            const gl = state.gl;
            const prog = state.program;
            names.forEach(function (name) {
                state.uLocs[name] = gl.getUniformLocation(prog, name);
            });
            state.uLocs.a_position = gl.getAttribLocation(prog, 'a_position');
        },

        _initGeometry: function () {
            const gl = state.gl;
            const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(state.uLocs.a_position);
            gl.vertexAttribPointer(state.uLocs.a_position, 2, gl.FLOAT, false, 0, 0);
        },

        /** GPU benchmark: run frames as fast as possible for 500ms, measure FPS */
        _startBenchmark: function (callback) {
            const startTime = performance.now();
            let frameCount = 0;
            const gl = state.gl;

            function benchmarkFrame() {
                frameCount++;
                const elapsed = performance.now() - startTime;
                if (elapsed < 500) {
                    // Render a test frame
                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    requestAnimationFrame(benchmarkFrame);
                } else {
                    const fps = frameCount / (elapsed / 1000);
                    callback(fps);
                }
            }

            requestAnimationFrame(benchmarkFrame);
        },

        _loop: function (now) {
            if (!state.running) return;
            state.animFrameId = requestAnimationFrame(this._loop.bind(this));

            // Frame timing
            const dt = (now - state.lastFrameTime) / 1000;
            state.lastFrameTime = now;
            state.frameCount++;

            // Adaptive quality: monitor frame times
            if (state.benchmarkComplete && state.frameCount > 60) {
                state.frameTimes[state.frameTimeIndex] = dt * 1000; // ms
                state.frameTimeIndex = (state.frameTimeIndex + 1) % FRAME_TIME_SAMPLE_SIZE;

                if (state.frameCount % 60 === 0) {
                    // Check average frame time
                    let avg = 0;
                    for (let i = 0; i < FRAME_TIME_SAMPLE_SIZE; i++) {
                        avg += state.frameTimes[i];
                    }
                    avg /= FRAME_TIME_SAMPLE_SIZE;

                    // Auto-downscale if consistently over budget
                    if (avg > TARGET_FRAME_TIME_MS * 1.5 && !state.adaptiveDownscale) {
                        state.adaptiveDownscale = true;
                        this._resize();
                        console.log('[WebGL] Adaptive downscale enabled (avg frame: ' + avg.toFixed(1) + 'ms)');
                    } else if (avg < TARGET_FRAME_TIME_MS * 0.5 && state.adaptiveDownscale) {
                        state.adaptiveDownscale = false;
                        this._resize();
                        console.log('[WebGL] Adaptive upscale restored (avg frame: ' + avg.toFixed(1) + 'ms)');
                    }
                }
            }

            // Light sweep animation
            if (state.lightSweepActive) {
                state.lightSweepTime += dt;
                state.lightSweep = Math.min(1, state.lightSweepTime / 1.5);
                if (state.lightSweep >= 1) {
                    state.lightSweepActive = false;
                    state.lightSweep = 0;
                }
            }

            state.fps = dt > 0 ? Math.round(1 / dt) : 60;

            // Get scene state
            const sceneState = window.MedPupScroll
                ? window.MedPupScroll.getSceneState()
                : this._defaultSceneState();

            this._updateUniforms(now, dt, sceneState);
            this._draw();
        },

        _defaultSceneState: function () {
            return {
                scroll: 0, scrollSmooth: 0, scrollVelocity: 0,
                mood: 0, moodBlend: 0,
                mouseX: 0, mouseY: 0,
                camElevation: 0, camYaw: 0,
            };
        },

        _updateUniforms: function (now, dt, ss) {
            const gl = state.gl;
            const u = state.uLocs;
            const scene = window.MedPupNature;
            if (!scene) return;

            gl.useProgram(state.program);

            // Resolution
            if (u.u_res) gl.uniform2f(u.u_res, state.canvas.width, state.canvas.height);

            // Time
            if (u.u_time) gl.uniform1f(u.u_time, now * 0.001);
            if (u.u_delta) gl.uniform1f(u.u_delta, Math.min(dt, 0.05));

            // Scroll
            if (u.u_scroll) gl.uniform1f(u.u_scroll, ss.scroll);
            if (u.u_scrollSmooth) gl.uniform1f(u.u_scrollSmooth, ss.scrollSmooth);
            if (u.u_scrollVelocity) gl.uniform1f(u.u_scrollVelocity, ss.scrollVelocity);

            // Camera
            if (u.u_camElevation) gl.uniform1f(u.u_camElevation, ss.camElevation);
            if (u.u_camFOV) gl.uniform1f(u.u_camFOV, ss.camFOV || 1.0);
            if (u.u_camYaw) gl.uniform1f(u.u_camYaw, ss.camYaw || 0);

            // Mouse
            if (u.u_mouse) gl.uniform2f(u.u_mouse, ss.mouseX, ss.mouseY);

            // Mood
            if (u.u_mood) gl.uniform1i(u.u_mood, ss.mood);
            if (u.u_moodBlend) gl.uniform1f(u.u_moodBlend, ss.moodBlend);

            // Light sweep
            if (u.u_lightSweep) gl.uniform1f(u.u_lightSweep, state.lightSweep);

            // Scene-specific uniforms
            scene.setUniforms(gl, u, ss, now * 0.001);

            // DRS
            if (u.u_drsTier) gl.uniform1f(u.u_drsTier, state.drsTier);

            // Startup warmup (first 2 seconds)
            const warmup = Math.max(0, 1.0 - state.frameCount / 120);
            if (u.u_warmup) gl.uniform1f(u.u_warmup, warmup);
        },

        _draw: function () {
            const gl = state.gl;
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

        _fallback: function () {
            document.body.classList.add('no-webgl');
            const oldCanvas = document.getElementById('particle-canvas-fallback');
            if (oldCanvas) oldCanvas.style.display = 'block';
            console.log('[WebGL] Using CSS/Canvas2D fallback');
        },
    };

})();
