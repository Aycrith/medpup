/**
 * MedPup Phase 5: Micro-Interactions
 * - Button ripple effects
 * - Skeleton loading states
 * - Enhanced FAQ accordion
 * - Scroll reveal polish (scale, blur, char reveal)
 * - Button loading states
 * - Toast notifications
 * - Form validation visuals
 */
(function () {
    'use strict';

    // ========== 5.1: BUTTON RIPPLE EFFECT ==========
    function initRipple() {
        document.querySelectorAll('.btn').forEach(function (btn) {
            // Ensure btn has overflow hidden
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';

            btn.addEventListener('click', function (e) {
                // Remove any existing ripple
                var existing = btn.querySelector('.btn-ripple');
                if (existing) existing.remove();

                // Create ripple element
                var ripple = document.createElement('span');
                ripple.className = 'btn-ripple';

                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = [
                    'width: ' + size + 'px',
                    'height: ' + size + 'px',
                    'left: ' + x + 'px',
                    'top: ' + y + 'px'
                ].join(';');

                btn.appendChild(ripple);

                // Clean up after animation
                ripple.addEventListener('animationend', function () {
                    ripple.remove();
                });
            });
        });
    }

    // ========== 5.2: SKELETON LOADING STATES ==========
    function initSkeletons() {
        // Auto-replace skeletons when content loads
        var skeletons = document.querySelectorAll('[data-skeleton]');
        if (!skeletons.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var loadDelay = parseInt(el.dataset.skeletonDelay || '800', 10);

                    // Simulate content loading (in real use, this would be an event/callback)
                    setTimeout(function () {
                        el.classList.add('skeleton-loaded');
                        // Fade out skeleton, fade in content
                        var content = el.querySelector('[data-skeleton-content]');
                        if (content) {
                            content.style.opacity = '0';
                            content.style.transition = 'opacity 0.4s ease';
                            el.style.transition = 'opacity 0.3s ease';
                            el.style.opacity = '0';
                            setTimeout(function () {
                                el.style.display = 'none';
                                content.style.opacity = '1';
                            }, 300);
                        }
                    }, loadDelay);

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        skeletons.forEach(function (s) { observer.observe(s); });
    }

    // ========== 5.3: ENHANCED FAQ ACCORDION ==========
    function initFAQ() {
        var faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(function (item) {
            var question = item.querySelector('.faq-question');
            if (!question) return;

            // Ensure answer has inner wrapper for grid animation
            var answer = item.querySelector('.faq-answer');
            if (answer && !answer.querySelector('.faq-answer-inner')) {
                var inner = document.createElement('div');
                inner.className = 'faq-answer-inner';
                while (answer.firstChild) {
                    inner.appendChild(answer.firstChild);
                }
                answer.appendChild(inner);
            }

            // Make answer focusable
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-expanded', 'false');

            function toggleItem(e) {
                // Don't toggle if clicking a link inside
                if (e.target.closest('a')) return;

                var isOpen = item.classList.contains('faq-open');

                // Close all other items (accordion behavior)
                faqItems.forEach(function (other) {
                    if (other !== item) {
                        other.classList.remove('faq-open');
                        other.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current
                item.classList.toggle('faq-open');
                item.setAttribute('aria-expanded', !isOpen);
            }

            question.addEventListener('click', toggleItem);
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleItem(e);
                }
            });
        });
    }

    // ========== 5.4: SCROLL REVEAL POLISH ==========
    function initRevealPolish() {
        // Enhanced reveal classes
        var revealSelectors = [
            '.reveal-scale',
            '.reveal-blur',
            '.reveal-char',
            '[data-animate]',
            '.fade-up',
            '.fade-in',
            '.slide-left',
            '.slide-right'
        ];

        var elements = document.querySelectorAll(revealSelectors.join(', '));
        if (!elements.length) return;

        // Add reveal-char spans to hero title words
        document.querySelectorAll('.reveal-char').forEach(function (el) {
            if (el.querySelector('span')) return; // Already processed
            var text = el.textContent.trim();
            el.innerHTML = text.split('').map(function (char) {
                return '<span style="transition-delay:' + (char === ' ' ? '0' : '') + '">' +
                    (char === ' ' ? '&nbsp;' : char) + '</span>';
            }).join('');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;

                    if (el.classList.contains('reveal-char')) {
                        // Character-by-character reveal
                        var spans = el.querySelectorAll('span');
                        spans.forEach(function (span, i) {
                            setTimeout(function () {
                                span.style.opacity = '1';
                                span.style.transform = 'translateY(0) rotateX(0)';
                            }, i * 30);
                        });
                    }

                    el.classList.add('animated');
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(function (el) { observer.observe(el); });
    }

    // ========== 5.5: BUTTON LOADING STATE HELPER ==========
    function initButtonLoading() {
        // Global helper: MedPup.showLoading(btn) / MedPup.hideLoading(btn)
        window.MedPup = window.MedPup || {};

        window.MedPup.showLoading = function (btn) {
            if (!btn) return;
            btn.classList.add('btn-loading');
            // Wrap text in span if not already
            if (!btn.querySelector('.btn-text')) {
                var text = btn.textContent.trim();
                btn.innerHTML = '<span class="btn-text">' + text + '</span>';
            }
        };

        window.MedPup.hideLoading = function (btn) {
            if (!btn) return;
            btn.classList.remove('btn-loading');
        };

        // Auto-detect forms with data-loading attribute
        document.querySelectorAll('form[data-loading]').forEach(function (form) {
            form.addEventListener('submit', function () {
                var submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    window.MedPup.showLoading(submitBtn);
                }
            });
        });
    }

    // ========== 5.6: TOAST NOTIFICATIONS ==========
    function initToasts() {
        // Create toast container if it doesn't exist
        var container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Global toast API
        window.MedPup = window.MedPup || {};

        window.MedPup.toast = function (message, type, duration) {
            type = type || 'info';
            duration = duration || 4000;

            var toast = document.createElement('div');
            toast.className = 'toast toast-' + type;
            toast.textContent = message;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');

            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(function () {
                toast.classList.add('visible');
            });

            // Auto-dismiss
            setTimeout(function () {
                toast.classList.remove('visible');
                setTimeout(function () {
                    toast.remove();
                }, 400);
            }, duration);
        };
    }

    // ========== 5.7: FORM VALIDATION VISUALS ==========
    function initFormValidation() {
        document.querySelectorAll('.form-input').forEach(function (input) {
            input.addEventListener('blur', function () {
                if (!input.value.trim()) {
                    input.classList.remove('valid', 'invalid');
                    return;
                }

                // Basic validation
                var isValid = true;
                var type = input.type;

                if (type === 'email') {
                    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                } else {
                    isValid = input.value.trim().length >= 2;
                }

                input.classList.toggle('valid', isValid);
                input.classList.toggle('invalid', !isValid);

                // Show/hide error message
                var formGroup = input.closest('.form-group');
                if (formGroup) {
                    var error = formGroup.querySelector('.form-error');
                    if (error) {
                        error.classList.toggle('visible', !isValid);
                    }
                }
            });

            // Clear validation on input
            input.addEventListener('input', function () {
                input.classList.remove('valid', 'invalid');
                var formGroup = input.closest('.form-group');
                if (formGroup) {
                    var error = formGroup.querySelector('.form-error');
                    if (error) error.classList.remove('visible');
                }
            });
        });
    }

    // ========== 5.8: ENHANCED STAGGER REVEALS ==========
    function initStaggerPolish() {
        var staggerContainers = document.querySelectorAll('[data-stagger]');
        if (!staggerContainers.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var container = entry.target;
                    var children = Array.from(container.children);
                    var baseDelay = parseInt(container.dataset.stagger || '150', 10);

                    children.forEach(function (child, index) {
                        if (!child.classList.contains('animated')) {
                            setTimeout(function () {
                                child.classList.add('animated');
                            }, index * baseDelay);
                        }
                    });

                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

        staggerContainers.forEach(function (c) { observer.observe(c); });
    }

    // ========== 5.9: CALCULATOR SKELETON AUTO-REPLACE ==========
    function initCalculatorSkeleton() {
        var calcPlaceholder = document.querySelector('.cost-calculator-placeholder');
        if (!calcPlaceholder) return;

        // The skeleton is shown by default; core.js replaces it with real calculator
        // We just add a smooth transition when it happens
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1 && node.classList.contains('calculator')) {
                            node.style.opacity = '0';
                            node.style.transform = 'translateY(10px)';
                            node.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                            requestAnimationFrame(function () {
                                node.style.opacity = '1';
                                node.style.transform = 'translateY(0)';
                            });
                        }
                    });
                }
            });
        });

        observer.observe(calcPlaceholder.parentNode, { childList: true });
    }

    // ========== 5.10: SECTION DIVIDER ANIMATION ==========
    function initDividerAnimation() {
        var dividers = document.querySelectorAll('.section-divider');
        if (!dividers.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });

        dividers.forEach(function (d) { observer.observe(d); });
    }

    // ========== INITIALIZE ALL ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initRipple();
            initSkeletons();
            initFAQ();
            initRevealPolish();
            initButtonLoading();
            initToasts();
            initFormValidation();
            initStaggerPolish();
            initCalculatorSkeleton();
            initDividerAnimation();
        });
    } else {
        initRipple();
        initSkeletons();
        initFAQ();
        initRevealPolish();
        initButtonLoading();
        initToasts();
        initFormValidation();
        initStaggerPolish();
        initCalculatorSkeleton();
        initDividerAnimation();
    }
})();
