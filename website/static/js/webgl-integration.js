// ============================================================
// MedPup WebGL2 Scroll Integration v3 — Water Horizon Scene
// Camera path mapping, mouse→sun, smooth scroll
// ============================================================
(function () {
    'use strict';

    const state = {
        scroll: 0,
        scrollSmooth: 0,
        scrollVelocity: 0,
        prevScroll: 0,
        mouseX: 0.5,
        mouseY: 0.5,
        targetMX: 0.5,
        targetMY: 0.5,
        mood: 0,
        moodBlend: 0,
        moodTarget: 0,
        moodTransitioning: false,
        camElevation: 0,
        camPitch: 0,
        camFOV: 1.0,
        warpIntensity: 0,
        sections: [],
        ticking: false,
    };

    const LERP_SCROLL = 0.08;
    const LERP_MOUSE = 0.08;
    const VELOCITY_DECAY = 0.92;
    const MOOD_TRANSITION_SPEED = 0.008;
    const SCROLL_CAM_GAIN = 0.12;

    // Section mood mapping
    const SECTION_MOOD_MAP = {
        'hero': 0,        // Night
        'intro': 1,       // Dawn
        'steps': 2,       // Morning
        'calculator': 3,  // Midday
        'clinics': 4,     // Golden Hour
        'numbers': 4,
        'trust': 5,       // Dusk
        'faq': 5,
        'cta': 5,
        'disclaimer': 5,
    };

    // Camera path: position, pitch, FOV per scroll section
    // These create the feeling of camera movement through 3D space
    function getCameraTargets(scroll) {
        const s = Math.max(0, Math.min(1, scroll || 0));

        // Camera elevation: rises and falls through the scene
        const elevation = Math.sin(s * Math.PI * 1.5) * 0.15;

        // Camera pitch: tilt slightly as we move (look down → level → look up)
        const pitch = -0.02 + Math.sin(s * Math.PI * 1.2) * 0.015;

        // FOV: slight breathing effect
        const fov = 1.0 + Math.sin(s * Math.PI * 1.8) * 0.08;

        return { elevation: elevation, pitch: pitch, fov: fov };
    }

    // Warp intensity per mood (controls sun movement smoothness)
    const WARP_PER_MOOD = [0.3, 0.5, 0.6, 0.7, 0.5, 0.35];

    // --- INIT ---
    function init() {
        discoverSections();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });
        window.addEventListener('resize', function () { discoverSections(); }, { passive: true });

        onScroll();
        console.log('[WebGL] v3 integration initialized (' + state.sections.length + ' sections)');
    }

    function discoverSections() {
        state.sections = [];
        var els = document.querySelectorAll('[data-section]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var name = el.getAttribute('data-section');
            var moodId = SECTION_MOOD_MAP[name];
            if (moodId !== undefined) {
                state.sections.push({
                    el: el,
                    name: name,
                    mood: moodId,
                    top: 0,
                    bottom: 0,
                });
            }
        }
        state.sections.sort(function (a, b) {
            return Array.prototype.indexOf.call(a.el.parentNode.children, a.el)
                 - Array.prototype.indexOf.call(b.el.parentNode.children, b.el);
        });
        recalcPositions();
    }

    function recalcPositions() {
        var th = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        var vh = window.innerHeight;
        var scrollable = Math.max(1, th - vh);
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

    function onMouse(e) {
        state.targetMX = e.clientX / window.innerWidth;
        state.targetMY = e.clientY / window.innerHeight;
    }

    function updateScroll() {
        state.ticking = false;

        var scrollY = window.pageYOffset || window.scrollY || 0;
        var th = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        var vh = window.innerHeight;
        var scrollable = Math.max(1, th - vh);

        state.scroll = scrollY / scrollable;

        // Velocity with momentum
        state.scrollVelocity = (state.scroll - state.prevScroll) * 8;
        state.scrollVelocity *= VELOCITY_DECAY;
        state.prevScroll = state.scroll;

        recalcPositions();
        updateMood();

        // Camera from scroll — 3D path
        var cam = getCameraTargets(state.scrollSmooth);
        state.camElevation = cam.elevation;
        state.camPitch = cam.pitch;
        state.camFOV = cam.fov + SCROLL_CAM_GAIN * state.scrollVelocity * 0.5;
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
            var nd = Infinity;
            for (var i = 0; i < state.sections.length; i++) {
                var s = state.sections[i];
                var d = Math.min(Math.abs(state.scroll - s.top), Math.abs(state.scroll - s.bottom));
                if (d < nd) { nd = d; state.moodTarget = s.mood; }
            }
        }

        // Trigger light sweep on mood change
        if (state.mood !== state.moodTarget && !state.moodTransitioning) {
            if (window.MedPupWebGL) window.MedPupWebGL.triggerLightSweep();
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

        // Warp intensity — follows current mood
        var moodIdx = state.moodTransitioning ? state.moodTarget : state.mood;
        state.warpIntensity = WARP_PER_MOOD[Math.min(moodIdx, WARP_PER_MOOD.length - 1)] || 0.5;
    }

    // --- PUBLIC API ---
    function getSceneState() {
        // Smooth scroll
        state.scrollSmooth += (state.scroll - state.scrollSmooth) * LERP_SCROLL;
        state.scrollSmooth = Math.max(0, Math.min(1, state.scrollSmooth));

        // Smooth mouse
        state.mouseX += (state.targetMX - state.mouseX) * LERP_MOUSE;
        state.mouseY += (state.targetMY - state.mouseY) * LERP_MOUSE;

        return {
            scroll: state.scroll,
            scrollSmooth: state.scrollSmooth,
            scrollVelocity: state.scrollVelocity,
            mood: state.mood,
            moodBlend: state.moodBlend,
            // Mouse in 0-1 range (engine converts to -1 to 1)
            mouseX: state.mouseX,
            mouseY: state.mouseY,
            camElevation: state.camElevation,
            camPitch: state.camPitch,
            camFOV: state.camFOV,
            warpIntensity: state.warpIntensity,
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

    window.MedPupScroll = {
        init: init,
        getSceneState: getSceneState,
        getSections: function () { return state.sections; },
    };

})();
