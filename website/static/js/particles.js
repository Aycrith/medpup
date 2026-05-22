/**
 * MedPup Cinematic Particle System (Phase1A - Canvas 2D)
 * ~200 particles in 3 layers with per-section color/motion transitions
 * Total: ~5KB gzipped, zero dependencies
 */
(function () {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    let currentSection = 0;
    let targetColors = { r: 91, g: 192, b: 235 }; // default teal
    let currentColors = { ...targetColors };
    let animFrame;

    // Section color map (from Cinematic Plan V3)
    const sectionColors = [
        { r: 91, g: 192, b: 235 },  // Hero: teal
        { r: 139, g: 105, b: 20 },   // Steps: gold
        { r: 34, g: 197, b: 94 },    // Calculator: green
        { r: 91, g: 192, b: 235 },   // Clinics: teal
        { r: 139, g: 105, b: 20 },   // Trust: gold
        { r: 91, g: 192, b: 235 },   // CTA: teal
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticle(layer) {
        const isDeep = layer === 0;
        const isMid = layer === 1;
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: isDeep ? 1.5 + Math.random() * 2 : isMid ? 0.8 + Math.random() * 1.2 : 0.3 + Math.random() * 0.6,
            speedX: (Math.random() - 0.5) * (isDeep ? 0.1 : isMid ? 0.3 : 0.6),
            speedY: (Math.random() - 0.5) * (isDeep ? 0.05 : isMid ? 0.15 : 0.3),
            opacity: isDeep ? 0.05 + Math.random() * 0.1 : isMid ? 0.08 + Math.random() * 0.15 : 0.12 + Math.random() * 0.2,
            layer: layer
        };
    }

    function initParticles() {
        particles = [];
        // 3 layers: deep (50), mid (80), surface (70) = 200 total
        for (let i = 0; i < 50; i++) particles.push(createParticle(0));
        for (let i = 0; i < 80; i++) particles.push(createParticle(1));
        for (let i = 0; i < 70; i++) particles.push(createParticle(2));
    }

    function lerpColor(current, target, t) {
        return {
            r: current.r + (target.r - current.r) * t,
            g: current.g + (target.g - current.g) * t,
            b: current.b + (target.b - current.b) * t
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Smooth color transition
        currentColors = lerpColor(currentColors, targetColors, 0.02);

        particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around edges
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            // Draw particle
            const alpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.round(currentColors.r)},${Math.round(currentColors.g)},${Math.round(currentColors.b)},${alpha})`;
            ctx.fill();
        });

        animFrame = requestAnimationFrame(draw);
    }

    function updateSection() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const sectionIndex = Math.min(Math.floor(scrollPercent * 6), 5);
        
        if (sectionIndex !== currentSection) {
            currentSection = sectionIndex;
            const color = sectionColors[currentSection] || sectionColors[0];
            targetColors = { ...color };
        }
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateSection();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Init
    resize();
    initParticles();
    updateSection();
    draw();

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    // Reduce motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cancelAnimationFrame(animFrame);
        ctx.clearRect(0, 0, width, height);
    }
})();
