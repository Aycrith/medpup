// ============================================================
// MedPup Captain MedPup — Narrative 3D Scene
// "A shaggy dog navigates golden-hour waters toward safe harbor"
// ============================================================
// Architecture: Two-layer composition
//   Layer 1 (bottom): WebGL2 shader — water, sky, sun, stars
//   Layer 2 (this file): Three.js — cartoon boat, buoys, narrative elements
// ============================================================

(function () {
    'use strict';

    // ---- MOBILE DETECTION ----
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints < 5);

    if (isMobile) {
        document.body.classList.add('is-mobile');
        return; // Skip Three.js on mobile
    }

    // ---- SCROLL STATE ----
    var scrollState = {
        progress: 0,
        velocity: 0,
        lastScrollY: 0,
    };

    var sections = [
        { id: 'hero',    start: 0.0,  end: 0.15 },
        { id: 'intro',   start: 0.15, end: 0.30 },
        { id: 'steps',   start: 0.30, end: 0.45 },
        { id: 'calc',    start: 0.45, end: 0.58 },
        { id: 'clinics', start: 0.58, end: 0.70 },
        { id: 'numbers', start: 0.70, end: 0.80 },
        { id: 'trust',   start: 0.80, end: 0.90 },
        { id: 'cta',     start: 0.90, end: 1.0 },
    ];

    function updateScrollState() {
        var scrollY = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollState.progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
        scrollState.velocity = scrollY - scrollState.lastScrollY;
        scrollState.lastScrollY = scrollY;
    }

    // ---- EASING ----
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutBack(t) {
        var c1 = 1.70158, c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    // ============================================================
    // P0: CARTOON BOAT CANVAS TEXTURE
    // ============================================================
    // Draws a warm cartoon illustration: shaggy dog at helm of wooden sloop
    // Style: Vintage travel poster — fills not outlines, warm palette
    // Canvas: 512x384, transparent background

    var boatCanvas, boatTexture;

    function buildCartoonBoat() {
        var c = document.createElement('canvas');
        c.width = 512;
        c.height = 384;
        var ctx = c.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 512, 384);

        // ---- PALETTE ----
        var hullDark = '#6B3A1F';
        var hullMid = '#8B4513';
        var hullLight = '#A0522D';
        var sailCream = '#F5E6C8';
        var sailShadow = '#D4C4A0';
        var mastColor = '#5C3317';
        var dogTan = '#D4A574';
        var dogDark = '#B8864E';
        var dogLight = '#E8C9A0';
        var dogNose = '#2C1810';
        var eyeDark = '#1A0F08';
        var eyeHighlight = '#FFFFFF';
        var waterHighlight = 'rgba(255,255,255,0.25)';
        var goldAccent = '#D4A017';
        var wakeWhite = 'rgba(255,255,255,0.35)';
        var scarfRed = '#C44536';
        var skyGradientTop = '#87CEEB';
        var skyGradientBot = '#F5E6C8';

        // ---- SKY GRADIENT BACKDROP ----
        var skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
        skyGrad.addColorStop(0, skyGradientTop);
        skyGrad.addColorStop(1, skyGradientBot);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 512, 180);

        // Sun glow in sky
        var sunGrad = ctx.createRadialGradient(380, 60, 5, 380, 60, 70);
        sunGrad.addColorStop(0, 'rgba(255,220,100,0.9)');
        sunGrad.addColorStop(0.3, 'rgba(255,180,50,0.4)');
        sunGrad.addColorStop(1, 'rgba(255,150,50,0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, 512, 180);

        // ---- WATER LINE ----
        var waterY = 260;
        ctx.fillStyle = '#2A4060';
        ctx.fillRect(0, waterY, 512, 124);

        // Water reflections
        var refGrad = ctx.createLinearGradient(0, waterY, 0, 384);
        refGrad.addColorStop(0, 'rgba(135,206,235,0.15)');
        refGrad.addColorStop(0.5, 'rgba(42,64,96,0.8)');
        refGrad.addColorStop(1, 'rgba(20,30,50,0.9)');
        ctx.fillStyle = refGrad;
        ctx.fillRect(0, waterY, 512, 124);

        // Sun reflection on water
        ctx.strokeStyle = 'rgba(255,200,80,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var rx = 350; rx < 420; rx += 8) {
            var rw = 3 + Math.random() * 4;
            ctx.moveTo(rx, waterY + 10);
            ctx.lineTo(rx, waterY + 10 + rw);
        }
        ctx.stroke();

        // ---- WAKE (behind boat) ----
        ctx.strokeStyle = wakeWhite;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Left wake fan
        for (var wk = 0; wk < 8; wk++) {
            var wy = waterY + 5 + Math.random() * 15;
            var wlen = 10 + Math.random() * 20;
            ctx.beginPath();
            ctx.moveTo(10 + wk * 3, wy);
            ctx.lineTo(10 + wk * 3 - wlen, wy + Math.random() * 5);
            ctx.stroke();
        }
        // Right wake fan
        for (var wk2 = 0; wk2 < 6; wk2++) {
            var wy2 = waterY + 8 + Math.random() * 12;
            var wlen2 = 8 + Math.random() * 15;
            ctx.beginPath();
            ctx.moveTo(30 + wk2 * 2, wy2);
            ctx.lineTo(30 + wk2 * 2 + wlen2, wy2 + Math.random() * 5);
            ctx.stroke();
        }

        // ---- HULL (wooden sloop shape) ----
        // Main hull body
        ctx.beginPath();
        ctx.moveTo(60, waterY + 5);       // bow left
        ctx.quadraticCurveTo(140, waterY + 25, 200, waterY + 20);  // bottom curve
        ctx.quadraticCurveTo(230, waterY + 18, 260, waterY + 12);  // stern bottom
        ctx.lineTo(260, waterY - 5);
        ctx.lineTo(50, waterY - 5);
        ctx.closePath();
        var hullGrad = ctx.createLinearGradient(0, waterY - 5, 0, waterY + 25);
        hullGrad.addColorStop(0, hullLight);
        hullGrad.addColorStop(0.4, hullMid);
        hullGrad.addColorStop(1, hullDark);
        ctx.fillStyle = hullGrad;
        ctx.fill();

        // Hull outline
        ctx.strokeStyle = hullDark;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(60, waterY + 5);
        ctx.quadraticCurveTo(140, waterY + 25, 200, waterY + 20);
        ctx.quadraticCurveTo(230, waterY + 18, 260, waterY + 12);
        ctx.stroke();

        // Deck line
        ctx.strokeStyle = '#5C3317';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(55, waterY - 5);
        ctx.lineTo(258, waterY - 7);
        ctx.stroke();

        // Planking lines
        ctx.strokeStyle = 'rgba(92,51,23,0.3)';
        ctx.lineWidth = 0.5;
        for (var pl = 0; pl < 6; pl++) {
            var py = waterY - 3 + pl * 4;
            ctx.beginPath();
            ctx.moveTo(60 + pl * 2, py);
            ctx.lineTo(250 - pl * 3, py);
            ctx.stroke();
        }

        // Bow point
        ctx.beginPath();
        ctx.moveTo(55, waterY - 5);
        ctx.lineTo(40, waterY + 2);
        ctx.lineTo(60, waterY + 5);
        ctx.fillStyle = hullMid;
        ctx.fill();

        // Stern
        ctx.beginPath();
        ctx.moveTo(258, waterY - 7);
        ctx.lineTo(270, waterY - 10);
        ctx.lineTo(270, waterY + 3);
        ctx.lineTo(260, waterY + 8);
        ctx.closePath();
        ctx.fillStyle = hullDark;
        ctx.fill();

        // ---- MAST ----
        ctx.strokeStyle = mastColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(155, waterY - 8);
        ctx.lineTo(155, waterY - 140);
        ctx.stroke();

        // Mast top cap
        ctx.fillStyle = goldAccent;
        ctx.beginPath();
        ctx.arc(155, waterY - 140, 3, 0, Math.PI * 2);
        ctx.fill();

        // ---- BOOM (horizontal spar) ----
        ctx.strokeStyle = mastColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(155, waterY - 90);
        ctx.lineTo(245, waterY - 80);
        ctx.stroke();

        // ---- SAIL (trapezoid, filled) ----
        ctx.beginPath();
        ctx.moveTo(157, waterY - 135);  // top-left at mast
        ctx.lineTo(157, waterY - 25);  // bottom-left at mast
        ctx.lineTo(240, waterY - 18);  // bottom-right at boom end
        ctx.lineTo(225, waterY - 120); // top-right
        ctx.closePath();
        var sailGrad = ctx.createLinearGradient(157, waterY - 135, 240, waterY - 18);
        sailGrad.addColorStop(0, '#FFF8E8');
        sailGrad.addColorStop(0.5, sailCream);
        sailGrad.addColorStop(1, sailShadow);
        ctx.fillStyle = sailGrad;
        ctx.fill();
        ctx.strokeStyle = sailShadow;
        ctx.lineWidth = 1;
        ctx.stroke();

        // "MedPup" text on sail — small, gold, cursive style
        ctx.font = 'italic 11px Georgia, serif';
        ctx.fillStyle = '#8B6914';
        ctx.textAlign = 'center';
        ctx.fillText('MedPup', 195, waterY - 65);

        // Sail curve/wrinkle lines
        ctx.strokeStyle = 'rgba(180,160,120,0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(175, waterY - 120);
        ctx.quadraticCurveTo(200, waterY - 70, 230, waterY - 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(170, waterY - 100);
        ctx.quadraticCurveTo(190, waterY - 60, 210, waterY - 35);
        ctx.stroke();

        // ---- WHEEL (ship's helm) ----
        var wheelX = 210, wheelYref = waterY - 22;
        ctx.strokeStyle = mastColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wheelX, wheelYref, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = goldAccent;
        ctx.beginPath();
        ctx.arc(wheelX, wheelYref, 2, 0, Math.PI * 2);
        ctx.fill();
        // Spokes
        for (var sp = 0; sp < 6; sp++) {
            var sa = (sp / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(wheelX, wheelYref);
            ctx.lineTo(wheelX + Math.cos(sa) * 9, wheelYref + Math.sin(sa) * 9);
            ctx.stroke();
        }

        // ---- DOG (standing at helm, facing right) ----
        var dogCX = 130; // dog center X
        var dogCY = waterY - 30; // dog feet Y

        // Tail (wagging — angled up-right)
        ctx.strokeStyle = dogDark;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(dogCX - 22, dogCY - 18);
        ctx.quadraticCurveTo(dogCX - 38, dogCY - 35, dogCX - 32, dogCY - 42);
        ctx.stroke();
        // Tail tip (fluffy)
        ctx.fillStyle = dogLight;
        ctx.beginPath();
        ctx.arc(dogCX - 32, dogCY - 42, 4, 0, Math.PI * 2);
        ctx.fill();

        // Back legs (2 visible, pointing back-left)
        ctx.fillStyle = dogDark;
        ctx.beginPath();
        ctx.ellipse(dogCX - 15, dogCY - 2, 5, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(dogCX - 8, dogCY - 2, 4, 11, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Front legs (2 visible, pointing forward-right)
        ctx.fillStyle = dogTan;
        ctx.beginPath();
        ctx.ellipse(dogCX + 10, dogCY - 2, 4, 13, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(dogCX + 16, dogCY - 2, 4, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Paws (small circles at bottom of legs)
        ctx.fillStyle = dogDark;
        ctx.beginPath(); ctx.arc(dogCX - 16, dogCY + 10, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(dogCX - 9, dogCY + 9, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(dogCX + 11, dogCY + 11, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(dogCX + 17, dogCY + 10, 3, 0, Math.PI * 2); ctx.fill();

        // Body (oblong, slightly tilted)
        ctx.fillStyle = dogTan;
        ctx.beginPath();
        ctx.ellipse(dogCX, dogCY - 22, 22, 16, 0.05, 0, Math.PI * 2);
        ctx.fill();
        // Body outline
        ctx.strokeStyle = dogDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(dogCX, dogCY - 22, 22, 16, 0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Chest (lighter area)
        ctx.fillStyle = dogLight;
        ctx.beginPath();
        ctx.ellipse(dogCX + 14, dogCY - 24, 12, 12, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Scarf / collar
        ctx.fillStyle = scarfRed;
        ctx.beginPath();
        ctx.ellipse(dogCX + 6, dogCY - 34, 12, 4, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Collar knot hanging down
        ctx.beginPath();
        ctx.moveTo(dogCX + 2, dogCY - 30);
        ctx.lineTo(dogCX + 5, dogCY - 24);
        ctx.lineTo(dogCX - 1, dogCY - 24);
        ctx.lineTo(dogCX - 2, dogCY - 30);
        ctx.closePath();
        ctx.fill();

        // ---- HEAD (circle, facing right) ----
        var headX = dogCX + 28;
        var headY = dogCY - 38;
        var headR = 14;

        // Head fill
        ctx.fillStyle = dogTan;
        ctx.beginPath();
        ctx.arc(headX, headY, headR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = dogDark;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Forehead / top of head (lighter fur tuft)
        ctx.fillStyle = dogLight;
        ctx.beginPath();
        ctx.ellipse(headX + 2, headY - 8, 8, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // ---- EARS (floppy, golden retriever style) ----
        // Left ear (falls down on left)
        ctx.fillStyle = dogDark;
        ctx.beginPath();
        ctx.moveTo(headX - 6, headY - 10);
        ctx.quadraticCurveTo(headX - 20, headY + 2, headX - 14, headY + 16);
        ctx.quadraticCurveTo(headX - 8, headY + 14, headX - 2, headY - 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = dogMid;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Right ear (wind-blown, angled up-right)
        ctx.fillStyle = dogDark;
        ctx.beginPath();
        ctx.moveTo(headX + 10, headY - 8);
        ctx.quadraticCurveTo(headX + 22, headY - 20, headX + 28, headY - 14);
        ctx.quadraticCurveTo(headX + 24, headY - 6, headX + 14, headY - 4);
        ctx.closePath();
        ctx.fill();

        // ---- SNOUT (forward-right) ----
        ctx.fillStyle = dogLight;
        ctx.beginPath();
        ctx.ellipse(headX + 14, headY + 3, 9, 6, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = dogDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Nose (at front of snout)
        ctx.fillStyle = dogNose;
        ctx.beginPath();
        ctx.ellipse(headX + 18, headY + 1, 3.5, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Nose highlight (glossy)
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(headX + 17, headY - 0.5, 1.5, 1, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // ---- EYES ----
        // Left eye
        ctx.fillStyle = eyeHighlight;
        ctx.beginPath();
        ctx.ellipse(headX + 6, headY - 4, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeDark;
        ctx.beginPath();
        ctx.ellipse(headX + 7, headY - 3.5, 2.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlight
        ctx.fillStyle = eyeHighlight;
        ctx.beginPath();
        ctx.ellipse(headX + 8, headY - 4.5, 1, 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = eyeHighlight;
        ctx.beginPath();
        ctx.ellipse(headX + 12, headY - 2, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeDark;
        ctx.beginPath();
        ctx.ellipse(headX + 13, headY - 1.5, 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlight
        ctx.fillStyle = eyeHighlight;
        ctx.beginPath();
        ctx.ellipse(headX + 14, headY - 2.5, 0.8, 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (small smile)
        ctx.strokeStyle = dogNose;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX + 16, headY + 5);
        ctx.quadraticCurveTo(headX + 18, headY + 7, headX + 20, headY + 5);
        ctx.stroke();

        // Tongue (happy panting)
        ctx.fillStyle = '#E8878A';
        ctx.beginPath();
        ctx.ellipse(headX + 18, headY + 9, 3, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Paw on wheel (one paw resting on the helm)
        ctx.fillStyle = dogTan;
        ctx.beginPath();
        ctx.ellipse(wheelX - 8, wheelYref - 8, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = dogDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Toes on paw
        for (var to = 0; to < 4; to++) {
            var ta = -0.6 + to * 0.3;
            ctx.beginPath();
            ctx.arc(wheelX - 8 + Math.cos(ta + 0.5) * 4, wheelYref - 8 + Math.sin(ta + 2.5) * 3, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = dogDark;
            ctx.fill();
        }

        // ---- FLAG on mast top ----
        ctx.fillStyle = scarfRed;
        ctx.beginPath();
        ctx.moveTo(155, waterY - 140);
        ctx.lineTo(155, waterY - 160);
        ctx.lineTo(135, waterY - 152);
        ctx.lineTo(155, waterY - 146);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // ---- WATER HIGHLIGHTS near hull ----
        ctx.strokeStyle = waterHighlight;
        ctx.lineWidth = 1;
        for (var wh = 0; wh < 5; wh++) {
            var wx = 60 + wh * 35;
            ctx.beginPath();
            ctx.moveTo(wx, waterY + 5);
            ctx.lineTo(wx + 15, waterY + 5);
            ctx.stroke();
        }

        return c;
    }

    // ============================================================
    // P1-P7: THREE.JS SCENE
    // ============================================================

    function initScene() {
        var THREE = window.THREE;
        if (!THREE) {
            console.warn('[CaptainMedPup] Three.js not available');
            return;
        }

        // ---- CREATE CANVAS ELEMENT ----
        var canvas = document.getElementById('cinematic-layer');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'cinematic-layer';
            canvas.className = 'cinematic-3d-layer';
            canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        // ---- BUILD BOAT TEXTURE ----
        boatCanvas = buildCartoonBoat();
        boatTexture = new THREE.CanvasTexture(boatCanvas);
        boatTexture.minFilter = THREE.LinearFilter;
        boatTexture.magFilter = THREE.LinearFilter;

        // ---- SCENE SETUP ----
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 35);
        camera.lookAt(0, 2, 0);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapped = 0; // Prevent Three.js tone mapping on our cartoon

        // ---- BOAT PLANE ----
        var boatPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 6),
            new THREE.MeshBasicMaterial({
                map: boatTexture,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
            })
        );
        boatPlane.position.set(-25, -3, -10);
        boatPlane.visible = false;
        scene.add(boatPlane);

        // ---- BOAT GROUP (for transforms) ----
        var boatGroup = new THREE.Group();
        boatGroup.add(boatPlane);
        scene.add(boatGroup);

        // ---- BUOY MARKERS ----
        var buoyData = [
            { name: 'ASPCA CVC',      x: 18, y: -1.5, z: -25, color: 0xEF4444, ringColor: 0x5BC0EB },
            { name: 'Good Care',       x: 22, y: -1.5, z: -30, color: 0xD4A017, ringColor: 0x5BC0EB },
            { name: 'HSTB Tampa',      x: 14, y: -1.5, z: -22, color: 0x5BC0EB, ringColor: 0x5BC0EB },
            { name: 'Harmony Vet',     x: 10, y: -1.5, z: -18, color: 0xFF8C00, ringColor: 0x5BC0EB },
        ];
        var buoyMeshes = [];
        var buoyFlagMeshes = [];

        buoyData.forEach(function(bd) {
            var buoyGroup = new THREE.Group();

            // Buoy body (cylinder, rounded)
            var body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8),
                new THREE.MeshBasicMaterial({ color: bd.color })
            );
            body.position.y = 0;
            buoyGroup.add(body);

            // Gold band
            var band = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.13, 0.05, 8),
                new THREE.MeshBasicMaterial({ color: 0xD4A017 })
            );
            band.position.y = 0.1;
            buoyGroup.add(band);

            // Top cone
            var cone = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.15, 6),
                new THREE.MeshBasicMaterial({ color: bd.color })
            );
            cone.position.y = 0.28;
            buoyGroup.add(cone);

            // Pulse glow sphere
            var glow = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: bd.color, transparent: true, opacity: 0.08, depthWrite: false })
            );
            glow.position.y = 0;
            buoyGroup.add(glow);

            // Equatorial ring
            var ring = new THREE.Mesh(
                new THREE.RingGeometry(0.25, 0.28, 16),
                new THREE.MeshBasicMaterial({ color: 0xD4A017, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
            );
            ring.rotation.x = Math.PI / 2;
            buoyGroup.add(ring);

            // Flag on mast (only on high DRS)
            if (window.MedPupWebGL && window.MedPupWebGL.drsTier >= 4) {
                var flagGroup = new THREE.Group();
                var pole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4),
                    new THREE.MeshBasicMaterial({ color: 0x888888 })
                );
                pole.position.y = 0.55;
                flagGroup.add(pole);

                var flag = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.2, 0.12),
                    new THREE.MeshBasicMaterial({ color: bd.color, side: THREE.DoubleSide })
                );
                flag.position.set(0.1, 0.7, 0);
                flagGroup.add(flag);

                buoyGroup.add(flagGroup);
                buoyFlagMeshes.push(flag);
            } else {
                buoyFlagMeshes.push(null);
            }

            buoyGroup.position.set(bd.x, bd.y, bd.z);
            buoyGroup.visible = false;
            buoyGroup.userData = { name: bd.name, baseY: bd.y, glowMesh: glow, ringMesh: ring };
            scene.add(buoyGroup);
            buoyMeshes.push(buoyGroup);
        });

        // ---- GOLDEN ARC (journey path) ----
        var arcCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-22, 5, -10),
            new THREE.Vector3(-10, 14, -20),
            new THREE.Vector3(5, 16, -28),
            new THREE.Vector3(15, 10, -26),
            new THREE.Vector3(22, 4, -24),
        ]);
        var arcTube = new THREE.Mesh(
            new THREE.TubeGeometry(arcCurve, 64, 0.08, 8, false),
            new THREE.MeshBasicMaterial({ color: 0xD4A017, transparent: true, opacity: 0.0, depthWrite: false })
        );
        scene.add(arcTube);

        // Inner core arc (brighter)
        var arcCore = new THREE.Mesh(
            new THREE.TubeGeometry(arcCurve, 64, 0.03, 8, false),
            new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.0, depthWrite: false })
        );
        scene.add(arcCore);

        // Traveling dot on arc
        var travelDot = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xFFD700 })
        );
        travelDot.visible = false;
        scene.add(travelDot);

        // ---- STATE ----
        var clock = new THREE.Clock();
        var mouseX = 0, mouseY = 0;
        var flashActive = false, flashTime = 0;
        var boatRevealed = false;

        // ---- INTERACTION ----
        canvas.addEventListener('click', function (e) {
            flashActive = true;
            flashTime = 0;
            // Boat tilt response
            if (window.MedPupWebGL) {
                window.MedPupWebGL.triggerLightSweep(0.6);
            }
        });

        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // ---- ANIMATION LOOP ----
        function animate() {
            requestAnimationFrame(animate);
            var elapsed = clock.getElapsedTime();
            var dt = clock.getDelta();

            updateScrollState();
            var p = scrollState.progress;

            // ---- FLAT FLASH ----
            if (flashActive) {
                flashTime += dt;
                if (flashTime > 1.5) {
                    flashActive = false;
                }
                // Bright overlay handled by light sweep in shader
            }

            // ---- BOAT SCROLL LIFECYCLE ----
            // P2: Boat position/size mapped to scroll
            // Section mapping:
            //   0.00-0.15 Hero:   boat tiny, far left, approaching
            //   0.15-0.30 Intro:  boat enters frame from left
            //   0.30-0.45 Steps:  boat visible, growing, following arc start
            //   0.45-0.58 Calc:   boat follows golden arc upward
            //   0.58-0.70 Clinics: boat past arc peak, approaching buoys
            //   0.70-0.80 Numbers: boat near camera, larger
            //   0.80-0.90 Trust:  boat resolved, calm, large
            //   0.90-1.00 CTA:    boat in near-foreground, safe harbor

            var boatX, boatY, boatZ, boatScale, boatAlpha, boatRoll;

            if (p < 0.10) {
                // Hidden — too small to see
                boatX = -40 + p * 80;
                boatY = -4;
                boatZ = -20;
                boatScale = 0.1 + p * 0.5;
                boatAlpha = p / 0.10;
            } else if (p < 0.30) {
                // Entering from left
                var t1 = (p - 0.10) / 0.20;
                t1 = easeOutBack(clamp(t1, 0, 1));
                boatX = lerp(-32, -15, t1);
                boatY = lerp(-4, -2.5, t1);
                boatZ = lerp(-20, -14, t1);
                boatScale = lerp(0.15, 0.5, t1);
                boatAlpha = 1;
            } else if (p < 0.50) {
                // Growing, following arc start
                var t2 = (p - 0.30) / 0.20;
                boatX = lerp(-15, 0, t2);
                boatY = lerp(-2.5, -1.5, t2);
                boatZ = lerp(-14, -12, t2);
                boatScale = lerp(0.5, 0.8, t2);
                boatAlpha = 1;
            } else if (p < 0.65) {
                // Following arc upward
                var t3 = (p - 0.50) / 0.15;
                var arcT = clamp(t3 * 0.6, 0, 1);
                var arcPos = arcCurve.getPoint(arcT);
                boatX = arcPos.x * 0.6;
                boatY = lerp(-1.5, 0.5, t3);
                boatZ = lerp(-12, -16, t3) - 4;
                boatScale = lerp(0.8, 1.0, t3);
                boatAlpha = 1;
            } else if (p < 0.80) {
                // Past arc peak, approaching buoys area
                var t4 = (p - 0.65) / 0.15;
                boatX = lerp(8, 12, t4);
                boatY = lerp(0.5, -0.5, t4);
                boatZ = lerp(-14, -10, t4);
                boatScale = lerp(1.0, 1.3, t4);
                boatAlpha = 1;
            } else {
                // Resolved, large, near camera
                var t5 = (p - 0.80) / 0.20;
                t5 = easeInOutCubic(clamp(t5, 0, 1));
                boatX = lerp(12, 5, t5);
                boatY = lerp(-0.5, 0.5, t5);
                boatZ = lerp(-10, -6, t5);
                boatScale = lerp(1.3, 1.6, t5);
                boatAlpha = 1;
            }

            // Breathing bob animation (always active when visible)
            var bob = Math.sin(elapsed * 1.2) * 0.15;
            var sway = Math.sin(elapsed * 0.7) * 0.02;

            // Click flash tilt
            var tiltAngle = 0;
            if (flashActive) {
                tiltAngle = Math.sin(flashTime * 8) * 0.08 * (1 - flashTime / 1.5);
            }

            if (p > 0.08 && !boatRevealed) {
                boatRevealed = true;
                boatPlane.visible = true;
                boatPlane.material.opacity = 0;
            }

            if (boatRevealed) {
                boatGroup.position.set(boatX, boatY + bob, boatZ);
                boatGroup.scale.set(boatScale, boatScale, boatScale);
                boatGroup.rotation.z = tiltAngle + sway;
                boatGroup.rotation.y = mouseX * 0.03; // Subtle look-toward-mouse
                boatPlane.material.opacity = lerp(boatPlane.material.opacity, boatAlpha, 0.1);

                // Pass boat position to shader for wake trail
                if (window.MedPupNature && window.MedPupNature.setBoatPosition) {
                    window.MedPupNature.setBoatPosition(boatX, boatZ);
                }
            }

            // ---- GOLDEN ARC OPACITY ----
            var arcOpacity = 0;
            if (p > 0.35) {
                arcOpacity = clamp((p - 0.35) / 0.10, 0, 0.45);
                if (p > 0.75) {
                    arcOpacity = lerp(0.45, 0.25, (p - 0.75) / 0.25);
                }
            }
            arcTube.material.opacity = lerp(arcTube.material.opacity, arcOpacity, 0.05);
            arcCore.material.opacity = lerp(arcCore.material.opacity, arcOpacity * 1.5, 0.05);

            // Traveling dot
            if (p > 0.40 && p < 0.70) {
                travelDot.visible = true;
                var dotT = (p - 0.40) / 0.30;
                var dotPos = arcCurve.getPoint(dotT);
                travelDot.position.copy(dotPos);
                travelDot.position.multiplyScalar(0.6);
                travelDot.position.y = dotPos.y * 0.4;
            } else {
                travelDot.visible = false;
            }

            // ---- BUOY MARKERS ----
            var buoysVisible = p > 0.55;
            var buoyOpacity = buoysVisible ? clamp((p - 0.55) / 0.10, 0, 1) : 0;

            buoyMeshes.forEach(function (bg, i) {
                bg.visible = buoysVisible;

                if (buoysVisible) {
                    // Gentle bob
                    bg.position.y = bg.userData.baseY + Math.sin(elapsed * 0.8 + i * 1.5) * 0.08;

                    // Glow pulse
                    bg.userData.glowMesh.material.opacity = lerp(
                        bg.userData.glowMesh.material.opacity,
                        0.06 + Math.sin(elapsed * 1.0 + i) * 0.03,
                        0.05
                    );

                    // Ring rotation
                    bg.userData.ringMesh.rotation.z = elapsed * 0.2 + i;

                    // Flag flutter
                    if (buoyFlagMeshes[i]) {
                        var flutter = Math.sin(elapsed * 3 + i * 2) * 0.15;
                        buoyFlagMeshes[i].rotation.y = flutter;
                        buoyFlagMeshes[i].rotation.z = Math.sin(elapsed * 4 + i) * 0.05;
                    }

                    // Mouse hover drift (P6)
                    if (mouseX > 0.3 && mouseX < 0.9) {
                        // Camera-area hover — gentle drift toward screen center
                        var hoverPull = clamp((mouseX - 0.3) / 0.6, 0, 1) * 0.5;
                        bg.position.x = lerp(bg.position.x, bg.position.x + 0.3, hoverPull * 0.02);
                    }
                }
            });

            // ---- CAMERA SUBTLE MOVEMENT ----
            // Slight camera sway tied to scroll to create parallax against shader
            var camSwayX = Math.sin(p * Math.PI * 2) * 0.3;
            var camSwayY = Math.sin(p * Math.PI * 1.5) * 0.2;
            camera.position.x = camSwayX + mouseX * 0.5;
            camera.position.y = 8 + camSwayY - mouseY * 0.3;
            camera.lookAt(0, 1, 0);

            // ---- RENDER ----
            renderer.render(scene, camera);
        }

        animate();

        // ---- RESIZE ----
        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Expose for debugging
        window.MedPupNarrative = {
            boatGroup: boatGroup,
            buoyMeshes: buoyMeshes,
            arcTube: arcTube,
        };
    }

    // ---- LOAD THREE.JS THEN INIT ----
    if (window.THREE) {
        initScene();
    } else {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = initScene;
        script.onerror = function () {
            console.warn('[CaptainMedPup] Three.js failed to load');
        };
        document.head.appendChild(script);
    }

    // ---- SCROLL LISTENER ----
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateScrollState();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    updateScrollState();

})();
