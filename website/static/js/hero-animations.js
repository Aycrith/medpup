/**
 * MedPup Hero Animations (Phase2B + 2C)
 * - Sequential fade-in for hero title words
 * - Count-up animation for hero stats
 */
(function () {
    'use strict';

    // --- Hero Word Sequential Fade-In (Phase2B) ---
    function initHeroWords() {
        const words = document.querySelectorAll('.hero-word');
        if (!words.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    words.forEach(word => {
                        const delay = parseInt(word.dataset.delay || '0', 10);
                        setTimeout(() => {
                            word.classList.add('visible');
                        }, delay);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) observer.observe(heroContent);
    }

    // --- Hero Stats Count-Up Animation (Phase2C) ---
    function animateValue(el, start, end, duration, prefix = '', suffix = '') {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + range * eased);
            el.textContent = prefix + current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Add pulse effect on complete
                el.style.transition = 'transform 0.3s ease';
                el.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 300);
            }
        }
        requestAnimationFrame(update);
    }

    function initHeroStats() {
        const statValues = document.querySelectorAll('.hero-stat-value');
        if (!statValues.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statValues.forEach(el => {
                        const text = el.textContent.trim();
                        // Parse different formats: "80-95%", "$25–$100", "100%"
                        if (text.includes('%')) {
                            const nums = text.match(/(\d+)/g);
                            if (nums && nums.length >= 1) {
                                const target = parseInt(nums[nums.length - 1], 10);
                                animateValue(el, 0, target, 1500, '', '%');
                            }
                        } else if (text.includes('$')) {
                            const nums = text.match(/\d+/g);
                            if (nums && nums.length >= 1) {
                                const target = parseInt(nums[nums.length - 1], 10);
                                const prefix = '$';
                                if (nums.length >= 2) {
                                    // Range like "$25–$100" - animate to the higher number
                                    animateValue(el, 0, target, 2000, prefix, '');
                                } else {
                                    animateValue(el, 0, target, 1500, prefix, '');
                                }
                            }
                        }
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) observer.observe(heroStats);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initHeroWords();
            initHeroStats();
        });
    } else {
        initHeroWords();
        initHeroStats();
    }
})();
