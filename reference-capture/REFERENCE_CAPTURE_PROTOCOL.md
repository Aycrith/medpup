# Reference Capture Protocol: Cinematic 3D Scene Reconstruction

## Goal
Acquire enough runtime, visual, and implementation evidence to recreate the visual approach of a cinematic 3D web scene without blindly copying protected assets or source. Recreate the technique, composition, motion language, shader behavior, layout system, and interaction model.

## Evidence Priority
1. Live browser runtime evidence (Chrome DevTools MCP)
2. Network/asset/source-map evidence (Playwright MCP)
3. WebGL/GPU frame evidence (Spector.js)
4. DOM/CSS/computed style evidence
5. Video/image perceptual evidence
6. Manual visual notes
7. Inference only where direct evidence is impossible

## Required Outputs
- `raw/` — Source video files
- `frames/` — Extracted frames at 2fps
- `scenes/` — Scene-change keyframes
- `analysis/palette.json` — Dominant color palette
- `analysis/motion_summary.json` — Camera motion estimates
- `analysis/typography_observations.md` — Font, spacing, placement
- `analysis/scene_timeline.md` — Timeline of major visual changes
- `analysis/camera_motion_estimate.json` — Light/parallax motion
- `analysis/visual_targets.md` — What to rebuild
- `webgl/spector_capture.json` — Full WebGL frame capture
- `screenshots/desktop_*.png` — Full viewport captures
- `screenshots/mobile_*.png` — Mobile viewport captures

## Browser Capture
Use Chrome DevTools MCP and Playwright MCP.

### Viewport States to Capture
1. Initial load state
2. Post-click / initialized state
3. Scroll positions: 0%, 25%, 50%, 75%, 100%
4. Hover/click states for nav and CTA
5. Mobile (375x667), Tablet (768x1024), Desktop (1440x900), Ultrawide (2560x1440)

### Data to Extract
- Console errors and warnings
- Network requests: fonts, images, scripts, textures, audio, video, wasm, source maps
- Performance trace during load and scroll
- DOM structure and computed CSS

## WebGL Capture
Use Spector.js injected into the page or browser DevTools.

### Frames to Capture
1. Hero initial frame
2. Mid-scroll frame
3. Highest-intensity animation frame
4. Any transition state
5. One dark/low-light frame if available

### Data to Extract
- Shader programs (vertex + fragment source)
- Uniform values (time, resolution, mouse, colors)
- Texture references and sizes
- Draw call sequence and count
- Render target sizes and framebuffer passes
- Postprocessing passes (bloom, tone mapping, FXAA)
- Canvas resolution and device pixel ratio
- Animation timing and frame cadence

## Video Analysis
Use FFmpeg and OpenCV for video/frame extraction.

### Frame Extraction
```bash
# Extract frames at 2fps
ffmpeg -i raw/reference.mp4 -vf fps=2 frames/frame_%04d.png

# Scene-change keyframes
ffmpeg -i raw/reference.mp4 -vf "select='gt(scene,0.08)',showinfo" -vsync vfr scenes/scene_%04d.png
```

### Analysis Products
- Keyframe contact sheet
- Timeline of major visual changes
- Dominant color palette (top 8 colors with hex values)
- Estimated camera movement (pan, tilt, dolly, orbit)
- Light source position over time
- Reflection path shape (if water/ocean)
- Horizon line position
- Typography placement and spacing
- Motion/animation notes (easing, duration, stagger)

## Reference Understanding Packet
After capture, create:
```
reference-understanding/
  00_summary.md                   # One-page overview of the scene
  01_scene_decomposition.md       # Scene type, layers, geometry
  02_visual_language.md           # Color grade, lighting, mood
  03_layout_typography.md         # Fonts, spacing, hierarchy
  04_shader_and_rendering.md      # Shader hypotheses
  05_interaction_model.md         # Scroll, click, hover behaviors
  06_animation_timing.md          # Cadence, easing, durations
  07_asset_inventory.md           # Textures, fonts, audio, models
  08_implementation_plan.md       # Build order, tech stack
  09_acceptance_criteria.md       # Pass/fail thresholds
  10_visual_regression_plan.md    # Screenshot comparison methodology
```

## Scene Specification Template
| Parameter | Description |
|-----------|-------------|
| Scene type | (cinematic procedural / atmospheric horizon / etc.) |
| Camera | (fixed / drift / parallax / orbit) |
| Lighting | (solar/lunar glow / ambient / directional) |
| Material | (water / sky / terrain / refractive) |
| Color grade | (teal/aqua / warm / monochrome / etc.) |
| Postprocessing | (bloom / fog / tone mapping / chromatic / blur) |
| Typography | (centered / left / luxury / minimal / etc.) |
| Interaction | (click-to-begin / scroll / hover / anchors) |
| Responsive | (center comp / horizon / hierarchy across sizes) |

## Verification Loop
After each implementation pass:
1. Run local dev server
2. Capture screenshots using Playwright at fixed viewport
3. Compare against reference frames using pixelmatch/SSIM
4. Document deltas and prioritize by perceptual importance
5. Fix the largest visual discrepancy first
6. Repeat until acceptance thresholds pass
