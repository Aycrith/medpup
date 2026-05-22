// ============================================================
// MedPup WebGL2 Scroll Integration — Section → Scene Mapping
// Maps scroll position to mood, camera, and scene parameters
// ============================================================
(function () {
    'use strict';

    // --- STATE ---
    const state = {
        scroll: 0,
        scrollSmooth: 0,
        scrollVelocity: 0,
        prevScroll: 0,
        mouseX: 0,
        mouseY: 0,
        mood: 0,
        moodBlend: 0,
        moodTarget: 0,
        moodTransitioning: false,
        camElevation: 0,
        sections: [],
        ticking: false,
    };

    const LERP_SCROLL = 0.08;
    const LERP_MOOD = 0.02;
    const VELOCITY_DECAY = 0.9;
    const MOOD_TRANSITION_SPEED = 0.008;

    // --- SECTION DEFINITIONS ---
    // Maps CSS section data attributes to mood IDs
    const SECTION_MOOD_MAP = {
        'hero': 0,
        'intro': 1,
        'steps': 2,
        'calculator': 3,
        'clinics': 4,
        'numbers': 4,
        'trust': 5,
        'faq': 5,
        'cta': 5,
        'disclaimer': 5,
    };

    // --- INIT ---
    function init() {
        // Discover sections
        discoverSections();

        // Scroll tracking
        window.addEventListener('scroll', onScroll, { passive: true });

        // Mouse tracking (normalized to 0-1)
        document.addEventListener('mousemove', function (e) {
            state.mouseX = e.clientX / window.innerWidth;
            state.mouseY = 1.0 - (e.clientY / window.innerHeight);
        }, { passive: true });

        // Resize: rediscover sections
        window.addEventListener('resize', function () {
            discoverSections();
        }, { passive: true });

        // Initial scroll read
        onScroll();

        console.log('[WebGL] Scroll integration initialized (' + state.sections.length + ' sections)');
    }

    function discoverSections() {
        state.sections = [];
        var els = document.querySelectorAll('[data-section]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var sectionName = el.getAttribute('data-section');
            var moodId = SECTION_MOOD_MAP[sectionName];
            if (moodId !== undefined) {
                state.sections.push({
                    el: el,
                    name: sectionName,
                    mood: moodId,
                    top: 0,
                    bottom: 0,
                });
            }
        }
        // Sort by DOM position
        state.sections.sort(function (a, b) {
            // Get DOM index
            var posA = Array.prototype.indexOf.call(a.el.parentNode.children, a.el);
            var posB = Array.prototype.indexOf.call(b.el.parentNode.children, b.el);
            return posA - posB;
        });
        recalcPositions();
    }

    function recalcPositions() {
        var totalHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        var viewportH = window.innerHeight;
        var scrollable = Math.max(1, totalHeight - viewportH);

        for (var i = 0; i < state.sections.length; i++) {
            var s = state.sections[i];
            var rect = s.el.getBoundingClientRect();
            s.top = (rect.top + window.pageYOffset) / scrollable;
            s.bottom = (rect.bottom + window.pageYOffset) / scrollable;
        }
    }

    // --- SCROLL HANDLING ---
    function onScroll() {
        if (!state.ticking) {
            window.requestAnimationFrame(updateScroll);
            state.ticking = true;
        }
    }

    function updateScroll() {
        state.ticking = false;

        var scrollY = window.pageYOffset || window.scrollY || 0;
        var totalHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        var viewportH = window.innerHeight;
        var scrollable = Math.max(1, totalHeight - viewportH);

        state.scroll = scrollY / scrollable;

        // Velocity
        state.scrollVelocity = (state.scroll - state.prevScroll) * 10;
        state.scrollVelocity *= VELOCITY_DECAY;
        state.prevScroll = state.scroll;

        // Update section ranges (in case content shifted)
        recalcPositions();

        // Determine current mood
        updateMood();

        // Calculate camera elevation from scroll
        state.camElevation = (state.scrollSmooth - 0.5) * 0.3;
    }

    function updateMood() {
        // Find which section the scroll is in
        var currentMood = state.mood;
        var found = false;

        for (var i = 0; i < state.sections.length; i++) {
            var s = state.sections[i];
            if (state.scroll >= s.top && state.scroll <= s.bottom) {
                state.moodTarget = s.mood;
                found = true;
                break;
            }
        }

        // If between sections, use the nearest
        if (!found) {
            var nearestDist = Infinity;
            for (var i = 0; i < state.sections.length; i++) {
                var s = state.sections[i];
                var dist = Math.min(
                    Math.abs(state.scroll - s.top),
                    Math.abs(state.scroll - s.bottom)
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    state.moodTarget = s.mood;
                }
            }
        }

        // Smooth mood transition
        if (state.mood !== state.moodTarget) {
            state.moodBlend += MOOD_TRANSITION_SPEED;
            if (state.moodBlend >= 1.0) {
                state.mood = state.moodTarget;
                state.moodBlend = 0.0;
                state.moodTransitioning = false;
            } else {
                state.moodTransitioning = true;
            }
        } else {
            state.moodBlend = 0.0;
            state.moodTransitioning = false;
        }
    }

    // --- PUBLIC API ---
    function getSceneState() {
        // Smooth scroll interpolation
        state.scrollSmooth += (state.scroll - state.scrollSmooth) * LERP_SCROLL;
        state.scrollSmooth = Math.max(0, Math.min(1, state.scrollSmooth));

        return {
            scroll: state.scroll,
            scrollSmooth: state.scrollSmooth,
            scrollVelocity: state.scrollVelocity,
            mood: state.mood,
            moodBlend: state.moodBlend,
            mouseX: state.mouseX,
            mouseY: state.mouseY,
            camElevation: state.camElevation,
        };
    }

    // --- AUTO-START ---
    // Wait for both engine and nature modules to be ready
    function autoInit() {
        if (window.MedPupWebGL && window.MedPupNature) {
            init();
            window.MedPupWebGL.init('v');
        } else {
            // Retry after modules load
            setTimeout(autoInit, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // --- EXPOSE ---
    window.MedPupScroll = {
        init: init,
        getSceneState: getSceneState,
        getSections: function () { return state.sections; },
    };

})();
