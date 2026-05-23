# 3D Scene — AAA World-Class Elevation Plan
## MedPup WebGL2 Water Horizon Scene — Comprehensive Enhancement Plan

**Goal:** Make the highest-quality AAA-world-class addition to the main 3D scene that improves immersion, engagement, and interactivity — while maintaining the MedPup brand, looking good, and being artistically implemented.

---

## 1. Current Scene State

### What Exists Right Now

| Layer | File | Technique | Role |
|---|---|---|---|
| WebGL2 shader engine | `website/static/js/webgl-engine.js` | Raw WebGL2, custom shader | GPU renderer, DRS tiers, benchmark |
| Shader source (nature) | `website/static/js/webgl-nature.js` | GLSL ES 3.0, raymarching | Water horizon, sky, stars, clouds, sun/moon |
| Scroll integration | `website/static/js/webgl-integration.js` | Vanilla JS store | Scroll→mood mapping, camera path, mouse→sun |
| Three.js particles/shapes | `website/static/js/cinematic-env.js` | Three.js r128 (CDN) | Particle system, floating wireframe shapes, light leak |
| Canvas2D fallback particles | `website/static/js/particles.js` | Canvas2D 2D context | 200 particles, 3 layers, scroll section color |
| Cursor trail | `website/static/js/cursor-trail.js` | Canvas 2D | Mouse-tracking particle trail |
| Hero animations | `website/static/js/hero-animations.js` | Vanilla JS | Word fade-in, stat count-up |
| Micro-interactions | `website/static/js/micro-interactions.js` | Vanilla JS | Ripple, skeleton, FAQ, stagger, toasts |

### Visual Hierarchy (bottom→top)

```
─────────────────────────────────────────  z-index 4
   DOM Content (hero headings, cards, CTA)
─────────────────────────────────────────  z-index 2-3
   Vignette, color-grade overlay, light leak canvas (CSS overlays)
─────────────────────────────────────────  z-index 0-1
   WebGL2 canvas (#v) + Three.js canvas + Canvas2D fallback
─────────────────────────────────────────
```

### What's Working

- Scroll-driven mood transitions (6 moods: night → dawn → morning → midday → golden → dusk)
- Raymarching water horizon with reflective surface
- Procedural night sky (stars + nebula + moon + crescent)
- Volumetric clouds, god rays, sun glare
- Mouse-driven sun position
- DRS tiering with auto-benchmark (4 GPU tiers)
- 3D cinematic camera path tied to scroll
- Light sweep flash on mood transitions
- Film color grading pipeline (8 steps: S-curve, Reinhard, shadow lift, saturation, gamma, vignette)
- Per-section CSS accent theming (teal/gold/green rotation)
- Hero word sequential fade-in, stat count-up
- 3D card tilt on hover
- Smooth button ripples, skeleton loaders, FAQ accordion
- Noise texture overlay

### Gaps & Weaknesses

1. **No 3D character presence** — The scene has zero pets/animals. MedPup's core identity is veterinary care.
2. **No narrative through-line visible in 3D** — The journey/concierge story is conveyed by text, not by the scene.
3. **Water plane is infinite flat surface** — No foam, no wetness variation, no depth cueing near shore.
4. **Three.js shapes are wireframe ghosts** — Wireframe torus/icosahedron/sphere shapes at 0.03-0.08 opacity are purely atmospheric. They read as subtle decoration, not narrative elements.
5. **Light leak effect is subtle** (0.04 opacity per band) — measurable impact on immersion is minimal.
6. **No ground plane / horizon detail** — The water meets a flat horizon with no beach, shore, or environment.
7. **No 3D medical or journey symbolism** — The "coordination service" and "vet travel" value propositions are absent from the 3D space.
8. **No on-scene interactivity** — Only mouse position → sun movement. No hover targets, click responses, or scene-state queries.
9. **No pet/animal avatar** — Users cannot relate to the scene through a character.
10. **No search/discoverability of 3D enhancements** — Current state only runs 5 JS files, this is already a mature scene.

---

## 2. Design Principles & Guardrails

Before picking a path, these rules govern every decision:

1. **Brand-first artistry:** Every 3D element must communicate MedPup's value proposition (trust, savings, accessible vet care, Pinellas pets). No unrelated decoration.
2. **Scene-as-environment, not decoration:** The scene IS the world the user scrolls through. It must feel like a place, not a wrapper.
3. **Golden-hour palette is non-negotiable per user:** The design explicitly prefers "dramatic vibrant warm scenes (golden hour) over muted/subtle (dawn/night)". Implemented as Mood 4 ("golden"): `envTint=[1.3, 0.50, 0.10]`, `waterColor=[0.10, 0.12, 0.08]`.
4. **No opaque CSS backgrounds hiding the scene:** Every section uses `rgba()` backgrounds with low opacity — populate the density checklist from AGENTS.md.
5. **Anti-bloat rule:** Don't add Three.js scenes that add 500KB+ in new assets. Procedural only. No external model downloads.
6. **Performance ceiling:** WebGL shader already has DRS tiering. Any new Three.js elements must degrade gracefully — use `window.MedPupWebGL.drsTier` to cap detail.

---

## 3. Assumption Audit

The plan skill requires this check before writing plan details. The primary question: **does this plan depend on unverified foundational claims?**

| Claim | Status | Note |
|---|---|---|
| Current scene works in production (site is live at localhost:1313) | UNVERIFIED | Need to confirm Hugo build passes and site previews |
| DRS tiering keeps the shader at 60fps on typical hardware | UNVERIFIED | Benchmark exists but thresholds (fps<25 tier--) are untested |
| Three.js r128 CDN loads reliably for users | UNVERIFIED | CDN dependency untested with error scenarios |
| The 6-mood system accurately maps emotional content to scroll sections | UNVERIFIED | Section labels ("Steps" → "golden") is a creative decision not user-validated |

**Verdict:** All 4 assumptions are UNVERIFIED but they are pre-existing technical implementation claims — not new business or market claims. They don't block writing the plan. The plan focuses entirely on adding 3D scene content; execution can validate during the build. No spike needed.

---

## 4. Concept Selection — The Narrative 3D Scene

Per `threejs-scene-tuning` skill's planning phase: **5 concepts presented first, user picks direction.**

### Concept A — "The Sanctuary" (the dog guardian)

**Visual:** A warm, breathing, friendly-looking dog guardian in 3D wireframe/silhouette form sits near the bottom of the 3D scene — watching over the viewer as they scroll. Above, luminous journey-arcs glow in the sky, connecting disappear-into-the-horizon destination waypoints. The water reflects the whole scene in gentle ripples.

**Emotional tone:** Loyal, protective, trustworthy, warm
**Three.js approach:** ~8 non-colliding wireframe spheres (body, head, ears, snout, collar, tag, tail, breath glow) + torus collar. No external model. Canvas texture fallback if spheres read as balloon animal.
**Brand fit:** "MedPup watches over your pet" = guardian dog watching over you. Collar tag = registered, legitimate business. Directional arcs = routing/travel service.
**Section unlocks:** Dog appears at "Steps" section; arcs appear at "Calculator"; destination markers at "Clinics"; heart-glow pulsing at "Trust".

---

### Concept B — "The Journey Map" (route travel)

**Visual:** A topographic wireframe horizon with glowing arcs representing clinic-route paths sweeping across it. Small pulsing spheres mark destination clinics. The viewer's cursor controls a traveling dot along the routes. The water plane below mirrors all of it.

**Emotional tone:** Adventure, progress, reliability, distance-traveled
**Three.js approach:** 2-3 `CatmullRomCurve3` → TubeGeometry (tube radius 0.05-0.1, meshBasicMaterial) with traveling dot sphere. Destination pulsing spheres.
**Brand fit:** "We route you to the lowest-cost clinic within driving distance" = travel paths + destinations on the scene.
**Section unlocks:** Routes appear at "Steps"; more routes/costs at "Calculator"; destination markers at "Clinics"; resolved journey at "Trust".

---

### Concept C — "The Promise" (medical + heart)

**Visual:** A warm, pulsing crown of light hovers at camera center — the "all-in cost guarantee" promise made tangible. Below it, the water's shimmering surface responds. The opening/mood color carries through to the end. A small dog-font icon glows at the water's edge as MedPup's signature.

**Emotional tone:** Calm, assured, premium, protective
**Three.js approach:** Central ring/torus geometry with pulsing emissive intensity (driven by scroll momentum = heartbeat). Dog font icon rendered on canvas texture plane at water level.
**Brand fit:** "All-in cost guaranteed" = the central glowing promise symbol that stays throughout.
**Section unlocks:** Ring appears at hero, intensifies at "Trust", resolves at CTA.

---

### Concept D — "The Constellation" (stars + pet + medical)

**Visual:** Night/dusk scene where the key elements (dog guardian, medical cross, heart, cost arc) are reimagined as a starfield/constellation connected by glowing lines. As the user scrolls, more constellation points emerge from darkness — progressively building the narrative.

**Emotional tone:** Magical, trustworthy, stellar, dreamlike
**Three.js approach:** 15-20 Points as `THREE.Points` with custom shader or `THREE.BufferGeometry` with AdditiveBlending. Connecting `THREE.Line` segments. Controls: 0.08 minimum radius per point.
**Brand fit:** "MedPup = trusted North Star for vet costs" — constellation navigation metaphor.
**Section unlocks:** Each section reveals 3-4 new constellation connections.

---

### Concept E — "Fireflies and the Journey" (emergence / procedural life)

**Visual:** Procedural firefly/particle organisms pulse through the 3D scene — clusters of tiny warm-gold lights swarming along invisible guide paths, gathering toward horizon waypoints, and dispersing into the water. The particle density and swarm-cohesion respond to scroll velocity. More swarming = higher engagement area.

**Emotional tone:** Playful, emergent, alive, hopeful
**Three.js approach:** `THREE.Points` with custom particle shader implementing Boids-lite or curl noise to create flocking behavior. Use the existing `particles.js` codebase as a springboard — upgrade from Canvas2D to Three.js `THREE.Points` + BufferGeometry. Swarm destination = waypoints matching the clinic route data.
**Brand fit:** Fireflies swarm away from a problem → gathering at a safe destination = MedPup shepherding pet owners toward cost certainty.
**Section unlocks:** Section labels correspond to the swarm's state: scattered (Hero), gathering direction (Steps), fee cleared (Calculator), settled (Clinics).

---

## 5. Decision Point — Single Direction

**Recommendation: Concept A + select extracts from Concept B.**

**Why this combination:**

Concept A alone is most aligned with the MedPup brand — a guardian dog feels like the emotional anchor for vet services. But Concept B's route arcs give Travel/Journey narrative texture that Concept A lacks. Together:
- Dog at Steps → "MedPup looks out for you"
- Route arcs at Calculator/Savings → "Here's how far/easy the savings come from"
- Destination markers at Clinics → "These are your destinations"
- Resolved scene at Trust/CTA → "Journey complete, you're safe"

This gives the 3D scene a **beginning-middle-end narrative arc**, not just a changing background.

**Reject the others for now:**
- Concept C (Promise ring): too abstract, reifies a UX micro-interaction not the brand's core identity
- Concept D (Constellation): weaker brand brand-fit (navigation metaphor is secondary to "pet guardian" primary metaphor)
- Concept E (Fireflies): lower brand-fit probability; requires boids algorithm which increases code complexity without proportional brand reward

**Confidence:** High — Concept A+B aligns with user's stated design philosophy (golden hour warmth, dramatic scene, artistic quality > business messaging) and the MedPup business model.

---

## 6. Implementation Plan — AAA World-Class 3D Scene Additions

### Architecture Decision: No r128 upgrade

The existing webgl-nature.js shader is a procedural raymarching pipeline in GLSL — it's the most sophisticated piece. **The plan upgrades Three.js scene scope within the existing r128** — the cinematic-env.js layer. No upgrade to r160+ needed; the scene complexity doesn't require it.

Three.js will run in its own layer (`cinematic-env.js`) while `webgl-nature.js` runs the shader background. This is a two-layer composition:
- **Layer 1 (bottom):** WebGL2 shader — water horizon, sky, procedural environment
- **Layer 2 (top, Three.js):** Narrative 3D objects — guardian dog, journey arcs, destination markers

---

### Phase G1: Guardian Dog — Narrative Anchor (15–20min build)

**What:** A stylized 3D dog figure rendered as a composition of wireframe + solid spheres. Placed low-left of the hero initially, fades in at the "Steps" section, gently sways (breathing animation).

**Priority:** #1 critical — no pets in scene = missing emotional connection.

**Steps:**
1. In `cinematic-env.js`, create a `buildGuardianDog()` function that assembles sphere-based geometry:
   - Body (ellipsoid, scale 1.2, 0.7, 0.9)
   - Head (sphere, scale 1.0)
   - Ears (2 spheres)
   - Snout (ellipsoid forward)
   - Nose (small sphere)
   - Eyes (2-sphere: dark base + golden iris glow — NOT a single point)
   - Collar (torus)
   - Tag (small sphere, gold)
   - Tail (2 spheres in arc)
2. Layer opacity: wireframe body @ 0.12 (higher than previous max 0.08 to be visible on dark water base), eyes solid @ 0.7.
3. Add `medpup-narrative-3d` CSS class for z-layering (< WebGL canvas solid for depth).
4. `updateNarrative` hook in animation loop: lerp `dogGroup.scale` from 0 → 1.0 over 1.2s, trigger at scroll ≥ 0.30.
5. Gentle breathing animation: `dogGroup.position.y += Math.sin(Date.now() * 0.00045) * 0.005`
6. Scale group to 3.0 at initial camera position so features clear the 0.05 SwiftShader minimum radius floor if hardware-accelerated.

**Files changed:**
- `website/static/js/cinematic-env.js` — new dog builder function
- `website/layouts/partials/footer/scripts.html` — ensure cinematic-env.js loads after webgl-nature.js

**Validation:**
```bash
cd website && hugo --minify
# Open localhost:1313, scroll to Steps section
# dog should be visible, wireframe body tips visible, eyes clearly defined
```

---

### Phase G2: Journey Arcs + Traveling Dot (12–15min build)

**What:** 2 luminous path ribbons sweeping across the upper scene. Each represents the "route from Pinellas → partner clinic" navigation story. A small bright dot animates along each arc when visible. Should read as hopeful / progress.

**Priority:** #2 — adds the "journey" narrative thread the dog alone doesn't provide.

**Steps:**
1. In `cinematic-env.js`, create `buildJourneyArcs()` using `THREE.CatmullRomCurve3` + `THREE.TubeGeometry`.
2. Two arcs at different heights:
   - Arc 1 (Pinellas → Hialeah): thick warm-amber tube, control point at `y=8`, span across mid-left.
   - Arc 2 (Pinellas → Liberty City): teal tube, control point at `y=6`, span across mid-right.
3. Tube radius 0.10 (visible solid), inner bright-core tube radius 0.04.
4. Traveling dot sphere (r=0.10, `meshBasicMaterial color=gold`) animated along arc at 0.25 progress/frame when in view.
5. Arc opacity: `lerp` 0 → 0.7 over scroll 0.30→0.45 section range.

**SwiftShader size note:** tube radius 0.10 + inner core radius 0.04 meets the SwiftShader 3D construction minimum at camera z=-5 range.

**Files changed:**
- `website/static/js/cinematic-env.js` — new arc builder

---

### Phase G3: Destination Markers — Clinic Waypoints (10min build)

**What:** Small pulsing sphere waypoints at the "end" of each route arc, representing the destination clinic. Visible at the "Clinics" section, pulses when camera approaches.

**Steps:**
1. 4 markers (ASPCA CVC Liberty City, Good Care Hialeah, HSTB Tampa, Harmony Vet Oldsmar)
2. Use 3-layer construction per marker: opaque solid core (r=0.12) + soft glow sphere (r=0.25, opacity=0.08) + subtle ring at equator (RingGeometry, r=0.35, opacity=0.06)
3. Fade-in at scroll ≥ 0.58, visible fully through Trust section
4. Pulse amplitude scales with `scrollVelocity` (more movement = more heartbeat-like)

**Files changed:**
- `website/static/js/cinematic-env.js` — marker builder

---

### Phase G4: Scene Interactivity Upgrade (20–25min build)

**What:** The 3D scene becomes responsive to user interaction, not just passive background.

1. **Hover glow on guardian dog** — when mouse enters a bounding sphere around the dog group (3D→2D project dogs to screen), increase dog emissive glow.
2. **Click flash** — clicking anywhere in the 3D canvas triggers a flash of color across all narrative elements (intensify emissive +0.3 for 300ms → decay back)
3. **Speed-of-scroll affect on particle turbulence** — faster scroll = more turbulence in the particle field (draws user's eye to rapid scrolling as a feature, not a bug)

**Priority:** #3 — transforms "nice background" into "interactive world."

---

### Phase G5: Water Plane Upgrade — Beach, Foam, Shore Detail (15min build)

**What:** The water/shore transition in the existing raymarching shader (`webgl-nature.js`) currently meets a flat infinite horizon. This upgrade:
1. Adds a **beach strip** at the near edge (bottom of screen): warm tan sand color blending into water color via distance.
2. Adds **wave foam** near the near plane: brighter foam on wave crest edges via `step()` on the wave height field.
3. Adds **near shoreline depth** — the water becomes more turbid (murky amber-gold) close to shore, transparent far away.

**Steps:**
1. In `webgl-nature.js`, after ground plane intersection (line ~503), add beach detection:
   `if (d < 25) { col = mix(sandColor, waterCol, smoothstep(2, 25, d)); }` where `sandColor = max(u_envTint * 0.2, vec3(0.04, 0.03, 0.01))`
2. Wave foam: at water intersection, add `float foam = smoothstep(0.12, 0.18, waveLocalH) * 0.3 * (1.0 - smoothstep(0, 30.0, d)); col += vec3(0.7) * foam;`
3. Near-shore turbidity: `float turbidity = 1.0 - smoothstep(0.0, 60.0, d); waterBase = mix(waterBase, sandColor * 0.5, turbidity * 0.4);`

**Files changed:**
- `website/static/js/webgl-nature.js`

---

### Phase G6: Cursor Trail Color Sync + Intensity (10min build)

**What:** The cursor trail (`cursor-trail.js`) currently spawns fixed accent/gold-colored particles. Upgrade to:
1. Read the current mood color from `window.MedPupScroll` (or fallback to `cinematic-env.js` particle color) — trail tail inherits scroll-section accent color.
2. Throttle particle count based on DRS tier (`window.MedPupWebGL.drsTier`) — low-tier hardware gets fewer particles.

**Files changed:**
- `website/static/js/cursor-trail.js`

---

### Phase G7: Scroll-Section Particle Intensity (8min build)

**What:** `particles.js` currently has 6 colors mapped to 6 sections. Add an intensity multiplier that matches section importance:

- Hero: 1.0× particle count (silent confidence)
- Intro: 1.0×
- Steps: 1.3× (section gets busy with dog + arcs)
- Calculator: 1.0×
- Clinics: 1.4× (marker flares add energy)
- Trust: 0.8× (calm, resolved)
- FAQ: 0.8×
- CTA: 0.9×

This reduces particle density where it would distract from content reading and increases it where visual drama supports the narrative beat.

**Files changed:**
- `website/static/js/particles.js`

---

### Phase G8: God-Rays / Sun-Glare Intensity Modulation (8min build)

**What:** The god-ray layer in `webgl-nature.js` is active only in `daylightFactor > 0.3` with fixed multiplier `0.04`. Upgrade:
1. Amplify god-ray intensity when `scrollVelocity` is high (quick scroll = more cinematic highlight)
2. Add a secondary flare ring: `float flareRing = smoothstep(0.992, 0.998, sunDot) * 0.04 * dayFactor; col += sunGlowColor * flareRing;`

**Files changed:**
- `website/static/js/webgl-nature.js`

---

### Phase G9: Narrative Light Sweep (10min build)

**What:** The existing `light sweep` (`webgl-engine.js` triggerLightSweep) on mood transitions is a lightning-strike flash. Upgrade to a **narrative sweep** — a thin horizontal beam of light that travels bottom→top on section entry, paired with a subtle particle scatter inside it.

**Steps:**
1. In `webgl-engine.js`, rebuild `triggerLightSweep` to animate a `sweepY` uniform from 0→1 over 2s.
2. In `webgl-nature.js` shader, add a new uniform `u_sweepY`, and multiply water + sky col by a thin band: `float band = smoothstep(0, 0.02, abs(uv.y - sweepY * 3.0 + 1.5)) * 0.03; col += sunGlow * band;`
3. Cue on specific section entries (Steps, Calculator, Clinics, Trust) — not just all mood changes.

**Files changed:**
- `website/static/js/webgl-engine.js`
- `website/static/js/webgl-nature.js`

---

### Phase G10: iOS Safari Fix — 3D Acceleration Path (15min build)

**What:** `cinematic-env.js` loads Three.js. On iOS Safari 17+, `will-change: transform` on `.cinematic-canvas` and the `translateZ(0)` GPU compositing hint forces a separate compositing layer. This prevents the canvas from being promoted to Software WebGL (CPU), which would drop `webgl-engine.js` DRS tier to 0 or 1.

**Steps:**
1. In `test.css`/`main.scss`: add `.cinematic-canvas { will-change: transform; transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; }`
2. In `cinematic-env.js`: force `renderer.setPixelRatio(1)` only on iOS Safari if `navigator.userAgent` matches.
3. Benchmark baseline on iPhone 14 Pro sim / local test if available.

**Files changed:**
- `website/test.css`
- `website/static/js/cinematic-env.js`

---

### Out of Scope / Future (not in this plan)

- Three.js procedural cloud layer replacing shader clouds (too complex for same session)
- Sound design (audio/ambient) — separate project
- Prefetching/clinch for next section — code complexity is high
- Loading Three.js via local bundle (zero CDN dependency) — worth doing as Phase G11 after initial pass works
- WebGL → WebGPU migration — premature

---

## 7. Files Changed Summary

| File | Type of change |
|---|---|
| `website/static/js/cinematic-env.js` | **High-change:** +guardianDog builder, arcs, markers, interactive glow |
| `website/static/js/webgl-nature.js` | **High-change:** beach/foam/shore, god-ray modulation, sweep band uniform |
| `website/static/js/webgl-engine.js` | **Medium-change:** narrative sweep (post section entry) |
| `website/static/js/cursor-trail.js` | **Medium-change:** color sync, DRS throttle |
| `website/static/js/particles.js` | **Low-change:** per-section intensity multiplier |
| `website/test.css` / `website/assets/scss/main.scss` | **Low-change:** iOS GPU compositing hints |
| `website/layouts/partials/footer/scripts.html` | **No-change expected** — script loading order already correct |

---

## 8. Testing / Validation

### Before Each.commit:
```bash
cd website && hugo --minify 2>&1 | grep -i error || echo "Build OK"
[ -f website/public/index.html ] && echo "Site built OK"
```

### Manual QA checklist:
- [ ] Open `localhost:1313` — WebGL2 canvas at bottom, Three.js canvas above
- [ ] Hero section: clear water horizon, visible stars if dark, dog invisible (not introduced yet)
- [ ] Scroll to Steps: dog assembles in ~1s, wireframe clearly visible, eyes glowing
- [ ] Scroll to Calculator: arcs appear (two glowing paths), traveling dot animates
- [ ] Scroll to Clinics: 4 waypoint markers appear, pulse on static hover near them
- [ ] Scroll to Numbers/Trust: scene resolves to warm calm color, marks fade to calm state
- [ ] CTA: final color keeps promise of resolution
- [ ] Click callback: flash across all narrative elements (300ms) — visible but not painful
- [ ] Fast scroll: particles become more turbulent, section intro sweeps trigger

### Performance:
- **Desktop 1080ti+**: Target 60fps, DRS tier 4 locked
- **Integrated GPU laptop**: Target 45fps, DRS tier should lock to 3
- **Low-tier / Intel HD 4000-630**: Target 30fps, DRS tier 2-3
- **Mobile (Droid/iPhone)**: Three.js disabled, only shader backdrop + Canvas2D — DRS tier 0-1

Use `performance.now()` on page load to verify shader frame rate before DRS lock.

---

## 9. Risks, Tradeoffs, Open Questions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Three.js canvas on top webgl-engine shader causes z-compositing flicker | Medium | High | Ensure Three.js canvas `z-index:0` and webgl canvas `z-index:0` — TWO separate canvases at same z, browser composites separately. Test on 2 monitors after build |
| Dog "balloon animal" perception if spheres don't read as dog | Low | Medium | Dog spec explicitly uses collar + 3-layer eyes + forward snout. Visual QA on localhost:1313 before committing |
| DRS-tier dependent device actually loads Three.js | Medium | Low | Three.js loads via CDN; failures handled by canvas fallback. DRS tier already respects GPU power limits |
| Future Three.js version breaking r128 API | Low | Low | `bufferGeometry` + `Points` API stable since r100. Scenes use no `onBeforeCompile` or deprecated paths |
| WebGL2 context loss mid-session | Low | High | User mentioned "critical lesson: never assume without verified data" — we should log context loss events and add recovery path after content settles |
| Guardian dog reads as "carnival balloon animal" rather than guardian micro-animal | Medium | High | If QA feedback says balloon — immediately switch to canvas (Font Awesome dog icon) silhouette approach per `threejs-scene-tuning` skill |

### Open Questions (need user input):
1. **Concept selection** — Strong A+B recommendation above. User approval needed before implementation.
2. **Dog breed/animation style** — golden lab style vs generic dog? Whistle/ear-flop animation or just breathe?
3. **Arc colors** — teal + gold (matching site palette) or clinic-brand matches (CAM/ASPCA colors)?
4. **Dog feel** — "playful / puppy" vs "guardian / noble" changes ear/tail geometry and breathing rhythm.

---

## 10. Implementation Order Summary

```
Priority   Phase    Time Est    # Files changed   What it unlocks
───────    ───────  ─────────   ───────────────   ─────────────────────────────────
  1        G1       15–20min    1 (cinematic-env)  Pet guardian = brand identity anchor
  1        G2       12–15min    1 (cinematic-env)  Journey narrative = service clarity
  2        G5       15min       1 (webgl-nature)   Water realism = immersive environment
  2        G3       10min       1 (cinematic-env)  Clinics as destinations = tangible routing
  2        G4       20–25min    2 (engine + env)   Interactive scene = engagement jump
  3        G6       10min       1 (cursor-trail)   Color-synced micro-interaction polish
  3        G7-G9    26min       3 (particles/engine/nature)  Atmosphere tuning
  4        G10      15min       2 (css + env)      iOS Safari reliability hardening
─────────────────────────────────────────────────────────────────────────────────
Total est    2.5–3 hrs   ~15 files       Hero section becomes a living branded world
```

**Recommended order:** G1 → G2 → G5 → G3 → G4 → G6 → G7/G8/G9 → G10

G5 (beach/foam) before G2/G3 = ushes the water into territory where narrative arcs can superimpose more cleanly (foam and arcs share the same z-depth plane — knowing the water is a stronger environmental element first prevents arc clipping issues).

---

*Plan saved: `.hermes/plans/2025-05-23_014500-3d-scene-aaa-elevation.md`*
