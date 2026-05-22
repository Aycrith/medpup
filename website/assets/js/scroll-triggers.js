/**
 * MedPup Scroll Triggers (Phase3B - Scroll-Driven Storytelling)
 * IntersectionObserver-based section transitions + element animations
 */
(function () {
    'use strict';

    // --- Section Transition Sweep (Phase3B Option 2) ---
    const sweep = document.createElement('div');
    sweep.id = 'section-sweep';
    sweep.style.cssText = 'position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0;background:linear-gradient(90deg,transparent 0%,rgba(91,192,235,0.05) 50%,transparent 100%);transition:opacity 0.3s ease;';
    document.body.prepend(sweep);

    let sweepTimeout;
    function triggerSweep() {
        sweep.style.opacity = '1';
        clearTimeout(sweepTimeout);
        sweepTimeout = setTimeout(() => { sweep.style.opacity = '0'; }, 600);
    }

    // --- Section Transition State ---
    let activeSection = null;
    let sectionProgress = {}; // Track progress through each section

    // --- IntersectionObserver for Section Transitions ---
    function initSectionObserver() {
        const sections = document.querySelectorAll('[data-section]');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = entry.target;
                const sectionName = section.dataset.section;

                if (entry.isIntersecting) {
                    // Calculate how much of the section is visible
                    const ratio = entry.intersectionRatio;
                    
                    // Section is ~60% visible (from Phase3B spec)
                    if (ratio >= 0.6 && activeSection !== sectionName) {
                        activeSection = sectionName;
                        
                        // Add active class for CSS transitions
                        document.querySelectorAll('[data-section].active').forEach(s => {
                            s.classList.remove('active');
                        });
                        section.classList.add('active');

                        // Trigger sweep transition
                        triggerSweep();

                        // Update particle system via custom event
                        window.dispatchEvent(new CustomEvent('sectionchange', {
                            detail: { section: sectionName }
                        }));
                    }

                    // Track per-section scroll progress
                    sectionProgress[sectionName] = ratio;
                    
                    // Trigger element animations within this section
                    triggerElementAnimations(section, ratio);
                }
            });
        }, {
            threshold: [0, 0.3, 0.6, 0.9, 1.0],
            rootMargin: '-10% 0px -10% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    // --- Per-Element Animation Triggers ---
    function triggerElementAnimations(section, ratio) {
        // Find elements with data-animate attribute within this section
        const animatedElements = section.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(el => {
            const delay = parseInt(el.dataset.delay || '0', 10);
            const animationType = el.dataset.animate;
            
            // Element should animate when its parent section is ~30% visible
            if (ratio >= 0.3 && !el.classList.contains('animated')) {
                setTimeout(() => {
                    el.classList.add('animated', animationType);
                }, delay);
            }
        });

        // Staggered children (e.g., step cards, trust cards)
        const staggerContainers = section.querySelectorAll('[data-stagger]');
        staggerContainers.forEach(container => {
            const children = container.children;
            const staggerDelay = parseInt(container.dataset.stagger || '150', 10);
            
            if (ratio >= 0.3) {
                Array.from(children).forEach((child, index) => {
                    if (!child.classList.contains('animated')) {
                        setTimeout(() => {
                            child.classList.add('animated', 'fade-up');
                        }, index * staggerDelay);
                    }
                });
            }
        });
    }

    // --- Smooth Scroll for Anchor Links ---
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // --- Initialize ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSectionObserver();
            initSmoothScroll();
        });
    } else {
        initSectionObserver();
        initSmoothScroll();
    }
})();
