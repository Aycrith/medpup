// ============================================================
// MedPup WebGL2 Cinematic Engine — Core Rendering Pipeline
// Full-screen procedural nature scene with day/night cycle
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
    };

    // --- PUBLIC API ---
    window.MedPupWebGL = {

        /** Initialize the WebGL2 canvas and start rendering */
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
                console.warn('[WebGL] WebGL2 not supported — fallback to CSS');
                this._fallback();
                return;
            }

            // DRS tier detection
            state.drsTier = this._detectDRSTier();
            this._resize();

            // Compile shaders from scene module
            if (!window.MedPupNature || !this._initShaders()) {
                console.warn('[WebGL] Shader compilation failed — fallback');
                this._fallback();
                return;
            }

            // Full-screen quad
            this._initGeometry();

            // Events
            window.addEventListener('resize', this._resize.bind(this), { passive: true });
            window.addEventListener('orientationchange', this._resize.bind(this), { passive: true });

            // Start loop
            state.running = true;
            state.lastFrameTime = performance.now();
            this._loop(state.lastFrameTime);

            console.log('[WebGL] Engine initialized (DRS tier ' + state.drsTier + ')');
        },

        /** Stop the engine and release resources */
        destroy: function () {
            state.running = false;
            if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
            if (state.gl) {
                const gl = state.gl;
                gl.useProgram(null);
                if (state.program) gl.deleteProgram(state.program);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
            state.gl = null;
        },

        // --- INTERNAL ---

        _detectDRSTier: function () {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile && window.innerWidth < 768) return 4;
            if (isMobile) return 3;
            if (window.innerWidth < 1024) return 2;
            return 0; // Desktop native
        },

        _resize: function () {
            const scale = [1.0, 1.0, 0.8, 0.6, 0.5][state.drsTier];
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

            // Vertex shader — full-screen quad
            const vsSrc = [
                '#version 300 es',
                'in vec2 a_position;',
                'void main() {',
                '    gl_Position = vec4(a_position, 0.0, 1.0);',
                '}'
            ].join('\n');

            // Get fragment shader from scene module
            const fsSrc = scene.getFragmentShaderSource();

            // Compile
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

            // Get uniform locations
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
            // Always get a_position attribute
            state.uLocs.a_position = gl.getAttribLocation(prog, 'a_position');
        },

        _initGeometry: function () {
            const gl = state.gl;
            // Full-screen quad (2 triangles = 4 vertices with triangle strip)
            const verts = new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                1, 1
            ]);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(state.uLocs.a_position);
            gl.vertexAttribPointer(state.uLocs.a_position, 2, gl.FLOAT, false, 0, 0);
        },

        _loop: function (now) {
            if (!state.running) return;
            state.animFrameId = requestAnimationFrame(this._loop.bind(this));

            // Frame timing
            const dt = (now - state.lastFrameTime) / 1000;
            state.lastFrameTime = now;
            state.frameCount++;

            // FPS counter (every 60 frames)
            if (state.frameCount % 60 === 0) {
                state.fps = Math.round(1 / dt);
            }

            // Get scene state from integration module
            const sceneState = window.MedPupScroll
                ? window.MedPupScroll.getSceneState()
                : this._defaultSceneState();

            this._updateUniforms(now, dt, sceneState);
            this._draw();
        },

        _defaultSceneState: function () {
            return {
                scroll: 0,
                scrollSmooth: 0,
                scrollVelocity: 0,
                mood: 0,
                moodBlend: 0,
                mouseX: 0,
                mouseY: 0,
                camElevation: 0,
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

            // Mouse
            if (u.u_mouse) gl.uniform2f(u.u_mouse, ss.mouseX, ss.mouseY);

            // Mood
            if (u.u_mood) gl.uniform1i(u.u_mood, ss.mood);
            if (u.u_moodBlend) gl.uniform1f(u.u_moodBlend, ss.moodBlend);

            // Scene-specific uniforms computed by scene module
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
            // Add class to body for CSS fallback styling
            document.body.classList.add('no-webgl');
            // Show existing canvas 2D particles
            const oldCanvas = document.getElementById('particle-canvas-fallback');
            if (oldCanvas) oldCanvas.style.display = 'block';
            console.log('[WebGL] Using CSS/Canvas2D fallback');
        },
    };

})();
