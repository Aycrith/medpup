// ============================================
// MedPup THREE.JS Cinematic Environment
// Continuous evolution driven by scroll position
// ============================================

(function() {
    'use strict';

    // Only load Three.js if not already present
    if (window.THREE) {
        initScene();
        return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initScene;
    script.onerror = function() {
        console.warn('Three.js failed to load — falling back to Canvas particles');
        initCanvasFallback();
    };
    document.head.appendChild(script);

    // ==========================================
    // SCROLL-DRIVEN STATE
    // ==========================================
    var scrollState = {
        progress: 0,        // 0 to 1 (top to bottom)
        velocity: 0,
        lastScrollY: 0,
        sectionProgress: {},  // per-section 0-1 progress
    };

    // Section boundaries for continuous mapping
    var sections = [
        { id: 'hero',    label: 'Hero',    start: 0.0, end: 0.15 },
        { id: 'intro',   label: 'Intro',   start: 0.15, end: 0.30 },
        { id: 'steps',   label: 'Steps',   start: 0.30, end: 0.45 },
        { id: 'calc',    label: 'Savings', start: 0.45, end: 0.58 },
        { id: 'clinics', label: 'Clinics', start: 0.58, end: 0.70 },
        { id: 'numbers', label: 'Numbers', start: 0.70, end: 0.80 },
        { id: 'trust',   label: 'Trust',   start: 0.80, end: 0.90 },
        { id: 'cta',     label: 'CTA',     start: 0.90, end: 1.0 },
    ];

    function updateScrollState() {
        var scrollY = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollState.progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
        scrollState.velocity = scrollY - scrollState.lastScrollY;
        scrollState.lastScrollY = scrollY;

        // Per-section progress
        sections.forEach(function(s) {
            if (scrollState.progress >= s.start && scrollState.progress <= s.end) {
                s.progress = (scrollState.progress - s.start) / (s.end - s.start);
            } else if (scrollState.progress > s.end) {
                s.progress = 1;
            } else {
                s.progress = 0;
            }
        });
    }

    // ==========================================
    // THREE.JS SCENE — Continuous Evolution
    // ==========================================
    function initScene() {
        var THREE = window.THREE;
        if (!THREE) return;

        var canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        // Scene setup
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 50);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // ==========================================
        // ENVIRONMENT COLORS (evolve with scroll)
        // ==========================================
        var colorStops = [
            { progress: 0.0, bg: new THREE.Color(0x030a14), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
            { progress: 0.15, bg: new THREE.Color(0x040e1a), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
            { progress: 0.30, bg: new THREE.Color(0x0a1628), accent: new THREE.Color(0x8B6914), particle: new THREE.Color(0x8B6914) },
            { progress: 0.45, bg: new THREE.Color(0x0d1829), accent: new THREE.Color(0x22c55e), particle: new THREE.Color(0x22c55e) },
            { progress: 0.58, bg: new THREE.Color(0x040e1a), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
            { progress: 0.70, bg: new THREE.Color(0x030a14), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
            { progress: 0.80, bg: new THREE.Color(0x0a1628), accent: new THREE.Color(0x8B6914), particle: new THREE.Color(0x8B6914) },
            { progress: 0.90, bg: new THREE.Color(0x040e1a), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
            { progress: 1.0, bg: new THREE.Color(0x030a14), accent: new THREE.Color(0x5bc0eb), particle: new THREE.Color(0x5bc0eb) },
        ];

        function lerpColor(a, b, t) {
            return new THREE.Color().lerpColors(a, b, t);
        }

        function getColorAtProgress(progress, colorArray) {
            for (var i = 0; i < colorArray.length - 1; i++) {
                if (progress >= colorArray[i].progress && progress <= colorArray[i + 1].progress) {
                    var t = (progress - colorArray[i].progress) / (colorArray[i + 1].progress - colorArray[i].progress);
                    return {
                        bg: lerpColor(colorArray[i].bg, colorArray[i + 1].bg, t),
                        accent: lerpColor(colorArray[i].accent, colorArray[i + 1].accent, t),
                        particle: lerpColor(colorArray[i].particle, colorArray[i + 1].particle, t),
                    };
                }
            }
            return colorArray[colorArray.length - 1];
        }

        // ==========================================
        // PARTICLE SYSTEM (Three.js Points)
        // ==========================================
        var PARTICLE_COUNT = 300;
        var positions = new Float32Array(PARTICLE_COUNT * 3);
        var colors = new Float32Array(PARTICLE_COUNT * 3);
        var sizes = new Float32Array(PARTICLE_COUNT);
        var velocities = [];

        // Initialize particles in 3D space
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            colors[i * 3] = 0.36;     // R
            colors[i * 3 + 1] = 0.75; // G
            colors[i * 3 + 2] = 0.92; // B

            sizes[i] = Math.random() * 3 + 0.5;

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.01,
                phase: Math.random() * Math.PI * 2,
            });
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        var material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        var particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // ==========================================
        // AMBIENT GEOMETRY (floating shapes)
        // ==========================================
        var shapes = [];

        // Create floating geometric shapes per section
        function createShape(type, x, y, z, color) {
            var geom;
            switch(type) {
                case 'octahedron': geom = new THREE.OctahedronGeometry(1.5, 0); break;
                case 'icosahedron': geom = new THREE.IcosahedronGeometry(1.2, 0); break;
                case 'torus': geom = new THREE.TorusGeometry(1, 0.3, 8, 16); break;
                case 'sphere': geom = new THREE.SphereGeometry(1, 16, 12); break;
                default: geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            }
            var mat = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.08,
                wireframe: true,
            });
            var mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(x, y, z);
            mesh.userData = { rotSpeed: { x: Math.random()*0.005, y: Math.random()*0.005 } };
            scene.add(mesh);
            shapes.push(mesh);
            return mesh;
        }

        // Hero shapes
        createShape('octahedron', -20, 10, -10, 0x5bc0eb);
        createShape('icosahedron', 25, -5, -15, 0x5bc0eb);
        createShape('torus', 15, 15, -20, 0x8B6914);

        // Intro shapes
        createShape('sphere', -30, -10, -12, 0x5bc0eb);
        createShape('octahedron', 20, 20, -18, 0x5bc0eb);

        // Steps shapes
        createShape('icosahedron', -25, 5, -14, 0x8B6914);
        createShape('torus', 30, -8, -16, 0x8B6914);

        // Calculator shapes
        createShape('sphere', -15, 12, -10, 0x22c55e);
        createShape('octahedron', 25, -15, -20, 0x22c55e);

        // Clinic shapes
        createShape('torus', -20, -12, -15, 0x5bc0eb);
        createShape('icosahedron', 18, 8, -12, 0x5bc0eb);

        // ==========================================
        // LIGHTING
        // ==========================================
        var ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        var pointLight = new THREE.PointLight(0x5bc0eb, 0.5, 100);
        pointLight.position.set(0, 0, 20);
        scene.add(pointLight);

        // ==========================================
        // ANIMATION LOOP
        // ==========================================
        var clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            var delta = clock.getDelta();
            var elapsed = clock.getElapsedTime();

            var progress = scrollState.progress;
            var colors = getColorAtProgress(progress, colorStops);

            // ---- CAMERA: cinematic scroll-driven movement ----
            // Ease the camera through the scene with cinematic damping
            var targetX = Math.sin(scrollState.progress * Math.PI * 2) * 18;
            var targetY = -scrollState.progress * 40;
            var targetZ = 50 + Math.sin(scrollState.progress * Math.PI) * 12;

            // Smooth damping (exponential decay)
            camera.position.x += (targetX - camera.position.x) * 0.05;
            camera.position.y += (targetY - camera.position.y) * 0.05;
            camera.position.z += (targetZ - camera.position.z) * 0.05;

            // Look at point ahead of current position for cinematic feel
            var lookAhead = scrollState.progress + 0.02;
            camera.lookAt(
                Math.sin(lookAhead * Math.PI * 2) * 18,
                -lookAhead * 40,
                0
            );

            // ---- UPDATE PARTICLE COLORS ----
            var pColors = geometry.attributes.color;
            for (var i = 0; i < PARTICLE_COUNT; i++) {
                pColors.array[i * 3] = colors.particle.r;
                pColors.array[i * 3 + 1] = colors.particle.g;
                pColors.array[i * 3 + 2] = colors.particle.b;
            }
            pColors.needsUpdate = true;

            // ---- PARTICLES: scroll-driven spiral with noise ----
            positions = geometry.attributes.position.array;
            var velIdx = 0;
            for (var i = 0; i < PARTICLE_COUNT; i++) {
                var v = velocities[velIdx++];

                // Multi-octave noise for organic movement
                var noise1 = Math.sin(elapsed * 0.3 + i * 0.017) * 0.015;
                var noise2 = Math.cos(elapsed * 0.5 + i * 0.023) * 0.01;
                var noise3 = Math.sin(elapsed * 0.7 + i * 0.031) * 0.008;

                // Scroll-driven spiral expansion
                var angle = elapsed * 0.2 + i * 0.02;
                var scrollFactor = 1 + progress * 0.8;
                var radius = (25 + i * 0.05) * scrollFactor;

                var targetX = Math.cos(angle) * radius + noise1 * 100;
                var targetY = (i / PARTICLE_COUNT - 0.5) * 70 - progress * 35 + noise2 * 50;
                var targetZ = Math.sin(angle) * radius * 0.5 + noise3 * 30;

                // Smooth interpolation
                positions[i * 3] += (targetX - positions[i * 3]) * 0.03;
                positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * 0.03;
                positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * 0.03;

                // Mouse repulsion (subtle)
                var dx = mouseX - positions[i * 3], dy = mouseY - positions[i * 3 + 1];
                var dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 60 && dist > 0) {
                    var force = ((60 - dist) / 60) * 0.15;
                    positions[i * 3] -= (dx / dist) * force;
                    positions[i * 3 + 1] -= (dy / dist) * force;
                }
            }
            geometry.attributes.position.needsUpdate = true;

        // ---- SHAPES: cinematic animation + proximity fade ----
            shapes.forEach(function(shape, idx) {
                // Smooth rotation
                shape.rotation.x += shape.userData.rotSpeed.x;
                shape.rotation.y += shape.userData.rotSpeed.y;
                shape.rotation.z += shape.userData.rotSpeed.z || 0;

                // Scale pulse based on scroll
                var pulse = 1 + Math.sin(elapsed * 0.5 + idx) * 0.05;
                shape.scale.set(pulse, pulse, pulse);

                // Fade based on proximity to current scroll section
                var shapeSection = Math.floor(idx / 2) / (shapes.length / 2);
                var dist = Math.abs(scrollState.progress - shapeSection);
                var targetOpacity = dist < 0.12 ? 0.12 : 0.03;
                shape.material.opacity += (targetOpacity - shape.material.opacity) * 0.05;

                // Color follows accent
                shape.material.color.copy(colors.accent);
            });
            // ---- LIGHTING COLOR ----
            pointLight.color.copy(colors.accent);

            // ---- UPDATE RENDERER ----
            renderer.render(scene, camera);
        }

        animate();

        // ---- RESIZE ----
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // ---- MOUSE INTERACTION ----
        var mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // ==========================================
        // REPLACE CANVAS PARTICLE SYSTEM
        // ==========================================
        window.particleSystem = {
            updateColors: function() {
                // Colors update automatically via scroll
            },
            switchSection: function(section) {
                // Section switching now handled by continuous scroll
            },
            destroy: function() {
                renderer.dispose();
            }
        };

        // Hide the canvas initially (Three.js takes over)
        canvas.style.zIndex = '0';
    }

    // ==========================================
    // CANVAS FALLBACK (if Three.js fails)
    // ==========================================
    function initCanvasFallback() {
        console.log('Using Canvas 2D fallback');
        // Revert to existing Canvas system
        if (window.initCanvasParticles) window.initCanvasParticles();
    }

    // ==========================================
    // SCROLL LISTENER
    // ==========================================
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateScrollState();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial state
    updateScrollState();

})();
