/**
 * MedPup Phase 5.7: Cursor Trail Effect
 * Subtle particle trail following the mouse on desktop only
 * Uses canvas for performance, mix-blend-mode: screen for glow
 */
(function () {
    'use strict';

    // Only run on non-touch devices with pointer fine (mouse, not touch)
    if ('ontouchstart' in window || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'cursor-trail';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W, H;
    var particles = [];
    var mouse = { x: -100, y: -100 };
    var isActive = false;
    var animFrame;

    // Config
    var MAX_PARTICLES = 30;
    var PARTICLE_LIFE = 0.8; // seconds
    var SPAWN_RATE = 3; // particles per frame when moving
    var BASE_SIZE = 3;
    var colors = [
        [91, 192, 235],   // accent
        [139, 105, 20],   // gold
    ];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticle(x, y) {
        var color = colors[Math.floor(Math.random() * colors.length)];
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.2 + Math.random() * 0.8;
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: BASE_SIZE * (0.5 + Math.random() * 0.8),
            color: color,
            life: PARTICLE_LIFE,
            maxLife: PARTICLE_LIFE,
        };
    }

    function update() {
        ctx.clearRect(0, 0, W, H);

        // Spawn new particles at mouse position
        if (isActive) {
            for (var s = 0; s < SPAWN_RATE; s++) {
                if (particles.length < MAX_PARTICLES) {
                    particles.push(createParticle(mouse.x, mouse.y));
                }
            }
        }

        // Update and draw particles
        var gravity = 0.001;
        var drag = 0.98;

        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];

            // Physics
            p.vx *= drag;
            p.vy *= drag;
            p.vy += gravity; // Slight fall
            p.x += p.vx;
            p.y += p.vy;

            // Age
            p.life -= 1 / 60; // Approximate 60fps

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            // Draw
            var lifeRatio = p.life / p.maxLife;
            var alpha = lifeRatio * 0.5;
            var size = p.size * lifeRatio;

            // Glow
            var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
            gradient.addColorStop(0, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + alpha + ')');
            gradient.addColorStop(0.4, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (alpha * 0.4) + ')');
            gradient.addColorStop(1, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(size * 3, 1), 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        animFrame = requestAnimationFrame(update);
    }

    // Mouse tracking
    document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isActive = true;
    });

    // Hide trail when mouse leaves window
    document.addEventListener('mouseleave', function () {
        isActive = false;
    });

    // Handle visibility change — pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            isActive = false;
        }
    });

    // Resize handler
    window.addEventListener('resize', resize);

    // Init
    resize();
    update();
})();
