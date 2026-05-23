// ============================================================
// MedPup WebGL2 Cinematic Engine v3 — 3D Camera Pipeline
// Mouse tracking: -1 to 1, DRS tier 4=highest, lock after bench
// ============================================================
(function () {
    'use strict';

    const state = {
        canvas: null,
        gl: null,
        program: null,
        uLocs: {},
        animFrameId: null,
        running: false,
        drsTier: 4,         // 4 = highest (desktop native), 0 = lowest
        canvasScale: 1.0,
        frameCount: 0,
        lastFrameTime: 0,
        fps: 60,

        // Benchmark
        benchmarkComplete: false,
        drsLocked: false,

        // Light sweep
        lightSweep: 0,
        lightSweepActive: false,
        lightSweepTime: 0,

        // Viscous scroll
        viscousScroll: 0,
    };

    const LIGHT_SWEEP_DURATION = 1.5;

    window.MedPupWebGL = {

        init: function (canvasId) {
            if (state.running) return;
            state.canvas = document.getElementById(canvasId || 'v');
            if (!state.canvas) { console.warn('[WebGL] Canvas not found'); return; }

            state.gl = state.canvas.getContext('webgl2', {
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
                depth: false,
            });
            if (!state.gl) {
                console.warn('[WebGL] WebGL2 not supported');
                this._fallback();
                return;
            }

            // Initial DRS (4=desktop native, will adjust after benchmark)
            state.drsTier = this._detectInitialTier();
            this._resize();

            if (!window.MedPupNature || !this._initShaders()) {
                console.warn('[WebGL] Shader compilation failed');
                this._fallback();
                return;
            }

            this._initGeometry();

            // GPU benchmark (doesn't block, adjusts DRS after 500ms)
            this._startBenchmark(function (fps) {
                if (state.drsLocked) return;
                state.benchmarkComplete = true;

                // Adjust DRS based on measured performance
                var adjusted = state.drsTier;
                if (fps < 25 && adjusted > 1) adjusted--;
                else if (fps < 30 && adjusted > 0) adjusted--;
                else if (fps > 55 && adjusted < 4) adjusted++;

                if (adjusted !== state.drsTier) {
                    state.drsTier = adjusted;
                    this._resize();
                    console.log('[WebGL] Benchmark ' + fps.toFixed(0) + 'fps → tier ' + adjusted);
                } else {
                    console.log('[WebGL] Benchmark ' + fps.toFixed(0) + 'fps — tier ' + state.drsTier + ' OK');
                }

                // Lock DRS permanently after benchmark
                state.drsLocked = true;
            }.bind(this));

            window.addEventListener('resize', this._resize.bind(this), { passive: true });
            window.addEventListener('orientationchange', this._resize.bind(this), { passive: true });

            state.running = true;
            state.lastFrameTime = performance.now();
            this._loop(state.lastFrameTime);

            console.log('[WebGL] Engine v3 initialized (initial tier ' + state.drsTier + ')');
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

        triggerLightSweep: function () {
            state.lightSweep = 0.01;
            state.lightSweepActive = true;
            state.lightSweepTime = 0;
        },

        // --- INTERNAL ---

        _detectInitialTier: function () {
            const ua = navigator.userAgent;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            const gl = state.gl;

            if (isMobile && window.innerWidth < 768) return 0; // lowest
            if (isMobile) return 1;
            if (window.innerWidth < 1024) return 2;

            // Check GPU
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                    if (/intel (hd|uhd) (4|5|6)\d{2}/.test(renderer) ||
                        /swiftshader|llvmpipe|mali-4\d{2}|adreno (3|4)\d{2}/.test(renderer)) {
                        return 3; // reduced desktop
                    }
                }
            }
            return 4; // highest — desktop native
        },

        _resize: function () {
            // DRSTier 4 = 1.0×DPR, 3 = 0.85×DPR, 2 = 0.7×DPR, 1 = 0.5×DPR, 0 = 0.4×DPR
            const tierToScale = [0.4, 0.5, 0.7, 0.85, 1.0];
            const scale = tierToScale[Math.min(state.drsTier, 4)];

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

            const vs = this._compileShader(gl.VERTEX_SHADER, vsSrc);
            const fs = this._compileShader(gl.FRAGMENT_SHADER, scene.getFragmentShaderSource());
            if (!vs || !fs) return false;

            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);

            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('[WebGL] Link error:', gl.getProgramInfoLog(prog));
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
                console.error('[WebGL] ' + (type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT') + ' shader error:', log);
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

        _startBenchmark: function (callback) {
            const startTime = performance.now();
            let frameCount = 0;
            const gl = state.gl;

            function benchFrame() {
                frameCount++;
                const elapsed = performance.now() - startTime;
                if (elapsed < 500) {
                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    requestAnimationFrame(benchFrame);
                } else {
                    callback(frameCount / (elapsed / 1000));
                }
            }
            requestAnimationFrame(benchFrame);
        },

        _loop: function (now) {
            if (!state.running) return;
            state.animFrameId = requestAnimationFrame(this._loop.bind(this));

            const dt = (now - state.lastFrameTime) / 1000;
            state.lastFrameTime = now;
            state.frameCount++;

            // Light sweep animation
            if (state.lightSweepActive) {
                state.lightSweepTime += dt;
                state.lightSweep = Math.min(1, state.lightSweepTime / LIGHT_SWEEP_DURATION);
                if (state.lightSweep >= 1) {
                    state.lightSweepActive = false;
                    state.lightSweep = 0;
                }
            }

            state.fps = dt > 0 ? Math.round(1 / dt) : 60;

            const sceneState = window.MedPupScroll
                ? window.MedPupScroll.getSceneState()
                : this._defaultSceneState();

            // Viscous scroll (momentum that decays)
            state.viscousScroll += (sceneState.scrollVelocity - state.viscousScroll) * 0.08;

            this._updateUniforms(now, dt, sceneState);
            this._draw();
        },

        _defaultSceneState: function () {
            return {
                scroll: 0, scrollSmooth: 0, scrollVelocity: 0,
                mood: 0, moodBlend: 0,
                mouseX: 0.5, mouseY: 0.5,
                camElevation: 0, camPitch: 0, camFOV: 1.0,
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
            if (u.u_scrollVelocity) gl.uniform1f(u.u_scrollVelocity, state.viscousScroll);

            // Camera — 3D
            if (u.u_camElevation) gl.uniform1f(u.u_camElevation, ss.camElevation);
            if (u.u_camPitch) gl.uniform1f(u.u_camPitch, ss.camPitch);
            if (u.u_camFOV) gl.uniform1f(u.u_camFOV, ss.camFOV);

            // Mouse — rahatil.co uses -1 to 1 range, Y×0.75
            const mx = (ss.mouseX - 0.5) * 2.0;
            const my = (0.5 - ss.mouseY) * 2.0 * 0.75; // invert Y
            if (u.u_mouse) gl.uniform2f(u.u_mouse, mx, my);

            // Mood
            if (u.u_mood) gl.uniform1i(u.u_mood, ss.mood);
            if (u.u_moodBlend) gl.uniform1f(u.u_moodBlend, ss.moodBlend);

            // Warp intensity — passed through from mood config
            if (u.u_warpIntensity) gl.uniform1f(u.u_warpIntensity, ss.warpIntensity || 0);

            // Scene-specific uniforms
            scene.setUniforms(gl, u, ss, now * 0.001);

            // DRS tier — 4=highest, sent as 4.0 (high = more features)
            if (u.u_drsTier) gl.uniform1f(u.u_drsTier, Math.max(0, state.drsTier));

            // Warmup — 0 = startup (black), 1 = fully visible
            // Use benchmark state: show black during bench, then fade in
            if (state.benchmarkComplete) {
                const fadeFrames = 90; // ~1.5s at 60fps
                const warmup = Math.max(0, Math.min(1, (state.frameCount - 30) / fadeFrames));
                if (u.u_warmup) gl.uniform1f(u.u_warmup, warmup);
            } else {
                if (u.u_warmup) gl.uniform1f(u.u_warmup, 0.0);
            }
        },

        _draw: function () {
            const gl = state.gl;
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

        _fallback: function () {
            document.body.classList.add('no-webgl');
            const fallback = document.getElementById('particle-canvas-fallback');
            if (fallback) fallback.style.display = 'block';
            console.log('[WebGL] Using Canvas2D fallback');
        },
    };

})();
