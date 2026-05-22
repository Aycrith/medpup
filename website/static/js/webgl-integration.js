// ============================================================
// MedPup WebGL2 Scroll Integration — Section → Scene Mapping v2
// Smooth scroll, mouse parallax, light sweep on transitions
// ============================================================
(function () {
    'use strict';

    // --- STATE ---
    const state = {
        scroll: 0,
        scrollSmooth: 0,
        scrollVelocity: 0,
        prevScroll: 0,
        mouseX: 0.5,
        mouseY: 0.5,
        mood: 0,
        moodBlend: 0,
        moodTarget: 0,
        moodTransitioning: false,
        lastMood: -1,
        camElevation: 0,
        camYaw: 0,
        camFOV: 1.0,
        sections: [],
        ticking: false,
    };

    const LERP_SCROLL = 0.08;
    const LERP_MOUSE = 0.05;
    const VELOCITY_DECAY = 0.9;
    const MOOD_TRANSITION_SPEED = 0.008;
    const MOUSE_PARALLAX_STRENGTH = 0.04;

    // --- SECTION DEFINITIONS ---
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

    // Section-based FOV (zoom feel)
    const SECTION_FOV = {
        0: 0.95,  // Night: slightly zoomed (intimate)
        1: 1.05,  // Dawn: wider (horizon expanding)
        2: 1.0,   // Morning: neutral
        3: 1.1,   // Midday: widest (transparency)
        4: 0.9,   // Golden hour: slightly zoomed (warm embrace)
        5: 0.95,  // Dusk: intimate again
    };

    // --- INIT ---
    function init() {
        discoverSections();

        window.addEventListener('scroll', onScroll, { passive: true });

        // Mouse tracking with smoother interpolation
        document.addEventListener('mousemove', function (e) {
            state.mouseX += ((e.clientX / window.innerWidth) - state.mouseX) * LERP_MOUSE;
            state.mouseY += ((1.0 - (e.clientY / window.innerHeight)) - state.mouseY) * LERP_MOUSE;
        }, { passive: true });

        window.addEventListener('resize', function () {
            discoverSections();
        }, { passive: true });

        onScroll();

        console.log('[WebGL] Scroll integration v2 initialized (' + state.sections.length + ' sections)');
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
        state.sections.sort(function (a, b) {
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

        recalcPositions();
        updateMood();

        // Camera elevation from scroll
        state.camElevation = (state.scrollSmooth - 0.5) * 0.3;

        // Camera yaw from mouse (subtle horizontal parallax)
        state.camYaw = (state.mouseX - 0.5) * MOUSE_PARALLAX_STRENGTH;
    }

    function updateMood() {
        var found = false;

        for (var i = 0; i < state.sections.length; i++) {
            var s = state.sections[i];
            if (state.scroll >= s.top && state.scroll <= s.bottom) {
                state.moodTarget = s.mood;
                found = true;
                break;
            }
        }

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

        // Detect mood change → trigger light sweep
        if (state.mood !== state.moodTarget && !state.moodTransitioning) {
            if (window.MedPupWebGL) {
                window.MedPupWebGL.triggerLightSweep();
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

        // Update FOV based on current mood
        var fovMood = state.moodTransitioning ? state.moodTarget : state.mood;
        state.camFOV = SECTION_FOV[fovMood] || 1.0;
        if (state.moodTransitioning) {
            var prevFov = SECTION_FOV[state.mood] || 1.0;
            state.camFOV = prevFov + (state.camFOV - prevFov) * state.moodBlend;
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
            camYaw: state.camYaw,
            camFOV: state.camFOV,
        };
    }

    // --- AUTO-START ---
    function autoInit() {
        if (window.MedPupWebGL && window.MedPupNature) {
            init();
            window.MedPupWebGL.init('v');
        } else {
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
