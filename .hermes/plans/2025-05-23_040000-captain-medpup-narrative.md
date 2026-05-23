# 3D Scene — Artistic Concept Plan
## "Captain MedPup Sails the Golden Hour"
### MedPup WebGL2 Scene — Narrative 3D Addition

---

**Creative concept first, technical second. Full plan below.**

---

## PART 1: THE ARTISTIC CONCEPT

### Core Insight

The WebGL2 shader scene is a photoreal dream-world: shimmering water, sun slipping toward the horizon, god rays, a sky that cycles from night to golden hour. It's电影级 — it wants a story, not decoration.

The story we tell:

> *MedPup isn't just a coordinator — MedPup is the one at the helm, navigating choppy waters toward safe harbor. The cost crisis is the storm. The boat is what gets you through it.*

### The Visual: "Captain MedPup"

A small cartoon-stylized boat on the water, at the edge of the worlds, with a dog-figure at the helm. The dog drives the boat. The whole thing is like a sticker you'd find on a vintage travel poster — deliberate, stylized, warm — placed inside an otherwise photoreal sunset seascape.

This is not a failed attempt at 3D realism. This is **intentional artistic collage** — a flat-cartoon element in a photoreal world, creating exactly the feeling of: "we're here to take you somewhere."

### What Makes It Coherent (Not a Grab-Bag)

Every element ties back to one concept:

| Element | What it symbolises | Why it's not random |
|---|---|---|
| The boat | MedPup's service — transport, safe passage | Sailing = journey, navigation = cost routing |
| The dog at the helm | MedPup itself (the guardian, the one who shows up) | Not just decoration — it IS the service |
| The golden arc | The journey path from home → clinic | Visible route to clarity |
| The waypoint buoys | Partner clinics on the horizon as destinations | Geographic anchors |
| The click flash | "The fog lifts" — clarity arriving | Interactive moment |

The scene tells one story from top to bottom: **storm → journey → safe harbor**.

---

## PART 2: CONCEPT ELEMENTS

### E1 — Captain MedPup's Cartoon Boat (Anchor element)

**What it is:**
A modal scene on a flat 2D canvas — a tiny cartoon illustration of a shaggy dog at the helm of a little wooden boat, sails taut, heading rightward into golden water. Rendered onto a Three.js plane that sits *flat on the water surface*, as if floating.

**Style brief:**
- Dog: shaggy tan floppy ears, wolflike enough to read but friendly. Floppy ears catch wind. Tail can wag (animated sine). Colors: light amber/cream against warm gold water.
- Boat: classic wooden sloop hull, white ripple wake behind it, gold trim.
- NOT 3D spheres — NOT wireframe — NOT extruded silhouette.
- It's a 2D illustration. The deliberate choice of 2D in a 3D world is a **stylistic art-director move**, not a technical limitation. It reads as playful, not broken.
- Postion: low in the scene, approaching horizon from off-screen left, entering as the user scrolls. Grows larger as it approaches camera.
- Animation: gentle bobbing on waves, ears flutter in wind, tail wag (fast sine for happy dog = "we're going somewhere good"), back-and-forth head look (saccade style = alert/attentive).

**Technical approach:**
Draw once on a hidden `<canvas>` element (512×384px, 2D context) at init time. Return the canvas. Use `THREE.CanvasTexture(canvas)` to apply to `THREE.PlaneGeometry(3.5, 2.6)`. `meshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })`. Wireframe opacity: 0 (solid flat).

**DRS tier:**
- Tier 0–1 (low-end GPU): canvas is pre-rendered, only plane size changes → free to include
- All tiers: no performance cost beyond texture upload at init

---

### E2 — Brilliant Blue Buoy Markers (4 clinic destinations)

**What they are:**
Small floating buoys at the "destination" end of the golden arc, each with a clinic-label card on a tiny stick. They bob and sway on the water. They have a small sail/flag animation on top — flag = direction, flag flutters with wind speed.

**Interactivity:**
Hover near a buoy → slow camera drift toward it (gentle gravitational pull). The MediPup narrative: "we're steering toward your best-priced clinic."

**Style:**
- Traditional nautical buoy shape (rounded-bottom cylinder)
- Buoy colors: medpup teal with a gold band
- Each buoy has a tiny triangular flag on a mast — flag flutters with scroll velocity (more scroll = more flutter = more responsive)

**Technical approach:**
Primitive shapes: cylinder body (radius 0.08, height 0.35), cone top, small flag mesh (2 triangles). `meshBasicMaterial` (opaque — no transparency, SwiftShader minimum size floor met).

**DRS tier:**
- Tier 0–1: buoys at 50% scale, no flags
- Tier 2–3: full size, no flags (flags are Tier 4 only)
- Tier 4: full size + flags

---

### E3 — MedPup Dog-Helmeted Driver (micro-title on flag)

**What it is:**
A tiny golden emoji/icon annotation on the boat's mast. It says "MedPup" in tiny cursive-style text, like the name on a racing yacht. On hover/click on the boat, the text pulses gold and shows a small tooltip: "MedPup Navigation · All-in cost confirmed."

**Technical approach:**
Draw the text with canvas `fillText`, then mask if needed for transparency.

---

### E4 — Wave Splash Layer (amplified water effect below boat)

**What it is:**
When the boat enters frame, the water shader's wave height field imperceptibly pulses at the boat's wake — a subtle upward spiral of heightened foam trails following the boat's path.

**Technical approach:**
Drives `u_waveHeight` uniform in the water shader. Boat tracks its 3D position and writes `u_waveCenter` + `u_waveIntensity` uniforms (needs shader augmentation — small uniform addition to `webgl-nature.js`). `webgl-nature.js` uses their current `GetWaterHeight` to calculate foam; extrude neighbor pixels to achieve a "trail" effect lasting ~500 frames after boat passes.

**This is the foam-beam analog:** it's not a separate particle layer; it's an energy-field ripple in the EXISTING water height field. Very low code addition for high perceived impact.

---

### E5 — Click → Sunset Gold Flash (narrative beat)

**What it is:**
Clicking the scene (not a button — anywhere on the 3D canvas) triggers a 1-second sunrise flash — the sky brightens momentarily as if sunrise just broke through, then settles. The boat tilts slightly. The scroll temporarily smooths back, then continues. This ties the interactive "this scene responds to me" moment to the all-in-cost-guarantee narrative: "we cut through the fog."

**Technical:**
`webgl-engine.triggerLightSweep()` already exists — repurpose the existing light sweep. When triggered from a click event, set a larger amplitude parameter; it's now a gold-dawn burst rather than understated highlight. The boat responds with a tilt animation (10-deg roll).

---

## PART 3: CONSTRAINT ANALYSIS

### Against the Current Scene

| Question | Answer |
|---|---|
| Does the shader camera match the Three.js boat position? | Boat floats at `y ~ -1.5` (below camera line, on water) — shader camera watches this plane via `camera.position.z + ro.y + rd.y` intersection in shader. MUST coordinate position in shader with Three.js camera. |
| What z-layer does the boat land on? | `.cinematic-canvas` (Three.js) is z-index 0 alongside `#v` (WebGL2 canvas, also z-index 0). They composit together using GPU layers (no z-fighting, or transform:translateZ(0) in CSS). Boat floats at y=-1.5 in Three.js world. The shader's water plane intersects at y=0 in its world-space — these must be brought into agreement. |
| DRS tier: what degrades gracefully? | Boat canvas is pre-rendered — always available. Buoy flags (tier 4 only). Foam trail (tier 2+). |
| Color consistency with 6-mood system? | Yes — boat tilts toward camera based on `u_mood`. Color tint is added to the boat's shadow/glow when the scene crosses into golden mood. |

---

## PART 4: SCROLL NARRATIVE — "THE BOAT'S JOURNEY"

The boat has a lifecycle tied to the scroll sections:

```
Scroll 0.00 (Hero)                    →boat starts Y ≈ far off-screen bottom-left, tiny
                                       "… a journey into golden waters"

Scroll 0.15→0.45 (Intro → Steps)       →boat comes INTO frame from left, grows 3x
                                       "Prep for the voyage. Departure."

Scroll 0.45→0.60 (Calculator)          →golden arc fades in above middle of screen
                                       boat positioned under arc, curving with it
                                       "Here's the journey path."

Scroll 0.60→0.70 (Clinics)             →4 denominational buoys appear at arc end
                                       "Destinations."

Scroll 0.70→0.85 (Numbers → Trust)     →boat nears camera (has traveled the arc), full size
                                       calm, resolved, safe harbor
                                       "You've arrived."

Scroll 0.90→1.00 (CTA → disclaimer)    →boat in near-foreground, reading-aloud
                                       calm water, blue/gold guarantees
                                       "Book now. The journey waits for no one."
```

Each transition uses `t(progress, sectionStart - 0.05, sectionStart + 0.10)` for opacity math.

---

## PART 5: IMPLEMENTATION ORDER

Build in dependency order. Each phase builds on the previous, so they must be sequential, not parallel.

| Phase | What | Dependencies | Time est | Risk |
|---|---|---|---|---|
| **P0** | Canvas boat illustration `buildCartoonBoat()` | None | 25min | Low |
| **P1** | Three.js scene wire-up: canvas → PlaneGeometry → shader position | P0 | 20min | Low |
| **P2** | Boat scroll lifecycle (appear → grow → travel arc → resolve) | P1 | 25min | Medium |
| **P3** | Buoy markers + flag animation | P2 | 30min | Medium |
| **P4** | Foam trail in shader (`u_waveWakeCenter` + `u_waveWakeIntensity` uniforms) | P1 | 20min | Medium |
| **P5** | Click → gold flash (existing light sweep, new trigger) | P1 | 10min | Low |
| **P6** | CSS integration: prevenu composite, z-layer | P0 | 5min | Low |
| **P7** | Cross-axis interaction: buoys drift toward mouse | P3 | 20min | Medium |
| **P8** | QA + micro-interaction polish | P7 | 15min | Low |
| | **Total** | | **~2.5hrs** | |

---

## ART DIRECTOR SIGN-OFF CHECKPOINT (BEFORE BUILD)

Before writing a single line of implementation code, confirm the concept is approved:

- [ ] "Cartoon dog in a realistic seascape" — intentional contrast, not failed 3D
- [ ] Boat sails FROM left → right as user scrolls — maps to "journey from home → clinic"
- [ ] Dog at the helm IS MedPup — the service navigates for you
- [ ] Buoy markers = partner clinics (ASPCA CVC, Good Care, HSTB, Harmony Vet)
- [ ] Aesthetics match: moody, cinematic, warm, premium concierge feel
- [ ] No business-UI elements in the boat scene (calculator inputs, pricing cards — those are in the DOM, not the scene)
- [ ] The only text literally in 3D is "MedPup" on the boat's mast (small, gold)
- [ ] The scene resolves to calm, resolved water at CTA — narrative completion

If all 8 are true, proceed to build.

---

## PART 6: TECHNICAL IMPLEMENTATION PLAN

### File ownership

| File | What changes |
|---|---|
| `website/static/js/cinematic-env.js` | +new: `buildCartoonBoat()` + animation group, buoy marker builder, scroll lifecycle, click handler |
| `website/static/js/webgl-nature.js` | +new: `u_waveWakeCenter` vec3, `u_waveWakeIntensity` float uniforms → foam trail in `GetWaterHeight` |
| `website/static/js/webgl-engine.js` | ~modify: `triggerLightSweep` accepts optional gold-flash amplitude flag |
| `website/static/js/webgl-integration.js` | ~modify: expose `getWiggleVector` helper for boat wake |
| `website/test.css` / `website/assets/scss/main.scss` | +new: iOS Safari GPU compositing hints for `.cinematic-canvas` z-layer |

### Boat canvas drawing spec — `buildCartoonBoat()`

Canvas size: 512×384. Background: transparent.

```javascript
function buildCartoonBoat() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    var ctx = c.getContext('2d');

    // Drawing layers (back → front):
    // 1. Wake splashes (white behind boat)
    // 2. Hull (box, burnt sienna/ochre outlines, warm fill)
    // 3. Sail (cream/ivory trapezoid, gold mast line)
    // 4. Deck + wheel
    // 5. Dog body (oblong golden-tan) [leftward on deck]
    // 6. Dog head (circle) [facing right = forward direction]
    // 7. Floppy ear left (long ellipse, tan with darker inside)
    // 8. Floppy ear right (same, wind-blown angle)
    // 9. Snout (ellipse on front-right)
    // 10. Nose (small circle, dark brown, glossy shine dot)
    // 11. Eyes (two circles: dark brown iris, white highlight)
    // 12. Tail wag arc (cubic bezier,animated wag)
    // 13. Front paw on wheel (one visible)
    // 14. Gold "MedPup" text on sail
    // 15. Captain's hat (simple cap shape, optional)

    return c;
}
```

**Art direction for drawing function:**
- Colors pulled from MedPup palette: `#d97706` (gold/amber), `#8B6914` (gold), `#5bc0eb` (teal), `#c2410c` (coral/warm), `#fef3c7` (cream)
- The dog is not realistic — it's intentionally simple and charming. The drawing priority is recognizability and warmth, not anatomical accuracy.
- Draw FILLS not outlines for the body. Dark outline only on the hull and sail for the "poster illustration" effect.

**Sync with scroll velocity:**
- `ctx.clearRect + redraw` = expensive — DON'T redraw per-frame
- Pre-render into 3 angle variants (left-profile, 3/4 right, right-profile) → pick based on scroll direction
- Or: draw forward-facing boat, use `canvas.style.transform: scaleX(...)` to flip direction — cheap and works

---

### Buoy marker shader math

3-layer construction matching the SwiftShader working patterns from the skill:

```js
// Layer 1: Solid core (visible at all distances)
var buoyCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8),
    new THREE.MeshBasicMaterial({ color: 0x5bc0eb })
);
buoyCore.position.y = 0;

// Layer 2: Pulse glow
var buoyPulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x5bc0eb, transparent: true, opacity: 0.08 })
);

// Layer 3: Orbital ring (rotating)
var buoyRing = new THREE.Mesh(
    new THREE.RingGeometry(0.30, 0.33, 32),
    new THREE.MeshBasicMaterial({ color: 0x8B6914, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
);
buoyRing.rotation.x = Math.PI / 2;
```

4 buoys with different top-color accents: ASPCA CVC = red, Good Care = gold, HSTB = teal, Harmony Vet = amber.

---

### Foam trail in shader — `GetWaterHeight` extension

In `webgl-nature.js`, after the wave height is computed, add a boat-proximity term:

```
// After existing wave height is computed:
vec3 wakeSamplePos = p;
// Sample along camera ray to simulate trail (3D extent below water)
float wakeDist = distance(wakeSamplePos.xz, u_waveWakeCenter.xz) * 0.05;
float wakeTrail = exp(-wakeDist) * u_waveWakeIntensity;
h += wakeTrail * 0.08 * (1.0 - smoothstep(0.0, 0.6, abs(wakeSamplePos.z)));
```

The `u_waveWakeCenter` uniform tracks the boat's position in world-space; `u_waveWakeIntensity` fades out over ~8 seconds (exponential decay) after boat passes a given point.

**Simpler alternative (if uniform addition is too complex):**
Skip the trail — buoys already signal arrival, and the boat growth on scroll tells the journey story. Save foam trail for a later enhancement if needed. Prefer simpler.

---

### Click → Gold Flash

`webgl-engine.js` already has `triggerLightSweep`. Extend it:
```js
triggerLightSweep: function(amplitude) {
    state.lightSweep = amplitude || 0.01;  // default 0.01, gold flash = 0.6
    state.lightSweepActive = true;
    state.lightSweepTime = 0;
}
```

Gold flash path: In `webgl-nature.js` shader, the light sweep already modulates color. For gold-flash intensity, multiply sun/sky with a high-amplitude band in the shader that peaks at the user's click's vertical screen position.

---

## PART 7: OPEN DECISIONS BEFORE BUILD

1. **Dog breed/type on canvas:** MedPup style = generic shaggy boy-dog (golden retriever-ish, floppy ears, warm tan) — this is representative, not a specific breed. Uses 8-10 ellipse/arc shapes. Confirm.

2. **Boat type:** Classic wooden sloop with single sail = most universally recognizable sailing/boating silhouette. Not a motorboat, not a yacht. Confirm.

3. **Boat direction:** sails from left → right across screen as user scrolls → CONFIRMS journey home → direction narrative. Or right → left? Left → right is more natural left-to-right reading.

4. **Text on sail:** "MedPup" in small gold typography or no text? User's style — current site keeps business text on DOM, not in scenes. Option: small "M" initial or sail orb at top of mast. DECISION NEEDED.

5. **Click flash on 3D canvas or entire page?** If a click anywhere (even on a text section) triggers the gold flash, the user builds a cognitive link between "I interact → scene responds." Recommend: 3D canvas area only, the boat interprets as a sticker-in-world with narrative agency. CONFIRM.

6. **Buoy labels in 3D scene:** Each buoy has a 3D text label above it (small, CSS DOM overlay positioned by Three.js projection matrix). Shows clinic name as tooltip. CONFIRM.

---

## PART 8: BUILD ORDER SUMMARY

```
PHASE          DURATION    WHAT IT UNLOCKS
───            ────────    ─────────────────────────────────────────────────────
P0             25 min      Boat canvas texture — the scene's emotional anchor
P1             20 min      Boat appears in 3D world, floats on water surface
P2             25 min      Boat movement arc tied to scroll → becomes narrative
P3             30 min      Buoy waypoints at arc end → concrete routing story
P4             20 min      Foam trail behind boat → tangible water interaction
P5–P6          15 min      Click flash, CSS layer — polish + polish artifact
P7             20 min      Buoy-hover drift toward mouse → interactive depth
P8             15 min      QA pass + micro-interactions
TOTAL          ~190 min    The scene goes from "pretty backdrop" to a treat to explore
```

**Recommended sequence:** P0 → P1 → P2 → (quick checkpoint: "boat visible, scrolling works?") → P3 → P5 → P7 → P4 → P8

---

## PART 9: WHAT THIS PLAN ISN'T

- It's NOT a particle system / visual effects dump (those already exist)
- It's NOT a business-UI rendering engine (the calculator, cards, pricing all stay DOM)
- It's NOT trying to make a shallow 3D attempt at a "realistic dog" (won't do sphere-stacking or extrusion)
- It's NOT multi-phase features bolted together (every element connects to one story)

This plan is: **"A shaggy dog navigates the golden-hour waters toward safe harbor, driven by the user's own scroll."**

If that concept isn't the right one, tell me what part of it misses the mark and I'll re-align before touching implementation.

---

*Plan: `.hermes/plans/2025-05-23_040000-captain-medpup-narrative.md`*
