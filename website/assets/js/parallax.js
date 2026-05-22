/**
 * MedPup Parallax & Mouse-Follow (Phase4A + Phase4B)
 * - Scroll-based parallax depth layers
 * - Mouse-follow parallax on hero/cards
 * - Uses requestAnimationFrame for perf
 */
(function () {
    'use strict';

    // ========== PARALLAX DEPTH LAYERS (Phase4A) ==========
    const parallaxLayers = document.querySelectorAll('[data-parallax]');
    if (parallaxLayers.length) {
        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.dataset.parallax) || 0.5;
                const rect = layer.getBoundingClientRect();
                const isVisible = rect.top < viewportHeight && rect.bottom > 0;

                if (isVisible) {
                    const yOffset = (rect.top - viewportHeight / 2) * speed * 0.1;
                    layer.style.transform = `translateY(${yOffset}px)`;
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateParallax();
    }

    // ========== MOUSE-FOLLOW PARALLAX (Phase4B) ==========
    const mouseTargets = document.querySelectorAll('[data-mouse-parallax]');
    
    if (mouseTargets.length && window.matchMedia('(min-width: 768px)').matches) {
        // Don't run on touch devices
        if ('ontouchstart' in window) return;

        const mouseState = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };

        // Track mouse position globally
        document.addEventListener('mousemove', (e) => {
            mouseState.targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
            mouseState.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        // Smooth animation loop
        function animateMouseParallax() {
            // Lerp towards target
            mouseState.x += (mouseState.targetX - mouseState.x) * 0.08;
            mouseState.y += (mouseState.targetY - mouseState.y) * 0.08;

            mouseTargets.forEach(el => {
                const strength = parseFloat(el.dataset.mouseParallax) || 1;
                const xOffset = mouseState.x * strength * -2; // Negative = opposite direction
                const yOffset = mouseState.y * strength * -2;
                
                // Apply subtle transform
                if (Math.abs(xOffset) > 0.01 || Math.abs(yOffset) > 0.01) {
                    el.style.transform = `perspective(800px) rotateY(${xOffset}deg) rotateX(${-yOffset}deg)`;
                }
            });

            requestAnimationFrame(animateMouseParallax);
        }

        animateMouseParallax();
    }

    // ========== 3D CARD HOVER TILT (Phase4C - enhanced) ==========
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    if (tiltCards.length && window.matchMedia('(min-width: 768px)').matches && !('ontouchstart' in window)) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Map to rotation: center=0, edges=±3deg
                const rotateY = (x - 0.5) * 6; // -3 to +3 deg
                const rotateX = (0.5 - y) * 6; // Invert Y for natural feel
                
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                card.style.boxShadow = `0 20px 40px ${getComputedStyle(document.documentElement).getPropertyValue('--section-glow').trim() || 'rgba(91,192,235,0.3)'}`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
                card.style.boxShadow = '';
            });
        });
    }

    // ========== REDUCED MOTION ==========
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        parallaxLayers.forEach(layer => {
            layer.style.transform = 'none';
        });
        mouseTargets.forEach(el => {
            el.style.transform = 'none';
        });
    }
})();
