// Preloader — show cinematic intro while resources load
(function() {
    'use strict';

    // Only show preloader if page takes > 300ms
    var preloaderTimeout;
    var preloaderShown = false;

    function createPreloader() {
        if (preloaderShown) return;
        preloaderShown = true;

        var overlay = document.createElement('div');
        overlay.id = 'preloader';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#030a14;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;transition:opacity 0.6s ease;';

        var logo = document.createElement('div');
        logo.textContent = 'MedPup';
        logo.style.cssText = 'font-family:"Cinzel",serif;font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,#5bc0eb,#8B6914);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:3px;';

        var dots = document.createElement('div');
        dots.style.cssText = 'display:flex;gap:8px;';
        for (var i = 0; i < 3; i++) {
            var dot = document.createElement('div');
            dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#5bc0eb;animation:pulseDot 1.4s ease-in-out infinite;animation-delay:' + (i * 0.2) + 's;';
            dots.appendChild(dot);
        }

        // Add keyframes if not already present
        if (!document.getElementById('preloader-styles')) {
            var style = document.createElement('style');
            style.id = 'preloader-styles';
            style.textContent = '@keyframes pulseDot{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}';
            document.head.appendChild(style);
        }

        overlay.appendChild(log);
        overlay.appendChild(dots);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    function hidePreloader() {
        var overlay = document.getElementById('preloader');
        if (!overlay) return;
        overlay.style.opacity = '0';
        setTimeout(function() {
            overlay.remove();
            document.body.style.overflow = '';
        }, 600);
    }

    // Show preloader after 300ms if page still loading
    preloaderTimeout = setTimeout(createPreloader, 300);

    // Hide when everything is loaded
    function onReady() {
        clearTimeout(preloaderTimeout);
        setTimeout(hidePreloader, 200); // small delay for cinematic feel
    }

    if (document.readyState === 'complete') {
        onReady();
    } else {
        window.addEventListener('load', onReady);
        // Fallback: hide after 5 seconds no matter what
        setTimeout(onReady, 5000);
    }
})();
