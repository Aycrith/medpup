/**
 * MedPup Phase 5.8: Enhanced Preloader
 * Smooth page load transition with logo, progress bar, and content fade-in
 */
(function () {
    'use strict';

    // Skip preloader if page is already loaded (e.g., back navigation)
    if (document.readyState === 'complete') {
        document.body.classList.add('preloader-done');
        return;
    }

    // Create preloader element
    var preloader = document.createElement('div');
    preloader.className = 'page-preloader';
    preloader.id = 'page-preloader';
    preloader.innerHTML = [
        '<div class="preloader-logo">MEDPUP</div>',
        '<div class="preloader-bar">',
        '    <div class="preloader-bar-fill"></div>',
        '</div>'
    ].join('');
    document.body.prepend(preloader);

    // Mark main content as preloader content for fade-in
    var mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('preloader-content');
    }

    // Helper: minimum display time (prevents flash)
    var MIN_TIME = 1200; // ms
    var startTime = Date.now();
    var isReady = false;
    var isVisible = false;

    function hidePreloader() {
        if (isVisible) return;
        isVisible = true;

        var elapsed = Date.now() - startTime;
        var remaining = Math.max(0, MIN_TIME - elapsed);

        setTimeout(function () {
            // Fade out preloader
            preloader.classList.add('hidden');

            // Fade in content
            if (mainContent) {
                mainContent.classList.add('visible');
            }

            // Mark body as ready
            document.body.classList.add('preloader-done');

            // Remove preloader from DOM after transition
            setTimeout(function () {
                preloader.remove();
            }, 700);
        }, remaining);
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            isReady = true;
            hidePreloader();
        });
    } else {
        isReady = true;
    }

    // Safety: force hide after 5 seconds max
    setTimeout(function () {
        if (!isVisible) {
            isReady = true;
            hidePreloader();
        }
    }, 5000);

    // Also hide on window load (images, fonts, etc.)
    window.addEventListener('load', function () {
        isReady = true;
        hidePreloader();
    });
})();
