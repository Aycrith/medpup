# Custom Theme Replacement Plan: Premium Design System from Scratch

## Overview
Replace the Stack theme entirely with a custom-built design system that achieves premium cinematic quality comparable to rahatil.co. This involves removing all theme dependencies and building every template, style, and component from scratch.

## Files to Remove
- `website/themes/stack/` (entire directory)
- Remove `theme: stack` from `hugo.yaml`
- Remove theme-specific configurations that will be replaced

## New File Structure to Create
```
website/
├── assets/
│   ├── scss/
│   │   ├── base/
│   │   │   ├── _reset.scss
│   │   │   ├── _variables.scss          # Brand colors, typography, spacing
│   │   │   ├── _typography.scss         # Font stacks, type scale
│   │   │   ├── _mixins.scss             # Reusable mixins
│   │   │   ├── _functions.scss          # Color functions, math helpers
│   │   │   ├── _animations.scss         # Keyframes, transition presets
│   │   │   ├── _gradients.scss          # Custom gradient definitions
│   │   │   └── _custom-properties.scss  # CSS custom properties
│   │   ├── components/
│   │   │   ├── _buttons.scss
│   │   │   ├── _cards.scss
│   │   │   ├── _forms.scss
│   │   │   ├── _navbar.scss
│   │   │   ├── _hero.scss
│   │   │   ├── _sections.scss
│   │   │   ├── _footer.scss
│   │   │   └── _utilities.scss
│   │   └── main.scss                    # Main entry point
│   ├── js/
│   │   ├── main.js                      # Main JS entry
│   │   ├── animations.js                # Scroll-triggered animations
│   │   ├── map-init.js                  # Leaflet map initialization
│   │   └── calculator.js                # Cost calculator logic
│   ├── illustrations/                   # Custom SVGs for each section
│   │   ├── hero-gradient-mesh.svg
│   │   ├── how-it-works-1.svg
│   │   ├── how-it-works-2.svg
│   │   ├── how-it-works-3.svg
│   │   ├── pricing-benefit-1.svg
│   │   ├── pricing-benefit-2.svg
│   │   ├── trust-badge-1.svg
│   │   └── trust-badge-2.svg
│   └── images/                          # Optimized raster images (if any)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html                  # Base template with skip-link, sematics
│   │   ├── list.html                    # Blog listing template
│   │   └── single.html                  # Single page template
│   ├── index.html                       # Custom homepage (marketing landing)
│   ├── partials/
│   │   ├── head/
│   │   │   ├── custom.html              # Schema markup, preconnects, meta
│   │   │   └── head.html                # Styles, scripts, fonts
│   │   ├── nav/
│   │   │   └── nav.html                 # Top navigation bar
│   │   ├── footer/
│   │   │   ├── footer.html
│   │   │   └── scripts.html
│   │   ├── widgets/
│   │   │   ├── cost-calculator.html
│   │   │   └── clinic-map.html
│   │   └── sections/
│   │       ├── hero.html
│   │       ├── how-it-works.html
│   │       ├── pricing-benefits.html
│   │       ├── trust-section.html
│   │       ├── clinic-grid.html
│   │       ├── faq-accordion.html
│   │       └── cta-section.html
│   └── sections/                        # Optional: reusable section templates
├── content/                             # Existing content files remain
├── static/
│   └── favicon.svg
└── hugo.yaml                            # Updated config without theme
```

## Phase-by-Phase Implementation

### Phase 1: Foundation & Templates
- [ ] Remove Stack theme from git submodule and hugo.yaml
- [ ] Create baseof.html with semantic structure, skip-to-content
- [ ] Create minimal index.html, single.html, list.html templates
- [ ] Create head partials with proper resource hints
- [ ] Create nav.html with gradient logo and theme toggle
- [ ] Create footer.html with legal links

### Phase 2: Design System Core
- [ ] Create CSS custom properties for:
  - Color palette (primary navy #030a14, accent cyan #5bc0eb, gold #8B6914)
  - Typography scale (display heading, body text, UI labels)
  - Spacing system (4px base unit)
  - Border radius system
  - Transition durations
  - Shadow elevations
- [ ] Create base reset and typography
- [ ] Establish CSS variable theming system (dark/light)

### Phase 3: Hero Section
- [ ] Create animated gradient mesh hero (CSS canvas or SVG)
- [ ] Add cinematic typography with Playfair Display
- [ ] Add hero illustration SVG
- [ ] Add compelling headline and subheadline
- [ ] Add primary CTA button with micro-interactions

### Phase 4: Section System
- [ ] Create section template with alternating backgrounds
- [ ] Add generous whitespace and visual rhythm
- [ ] Create how-it-works section with numbered steps and custom SVGs
- [ ] Create pricing benefits section with iconography
- [ ] Create trust section with partner logos and guarantees
- [ ] Create clinic grid with Leaflet map integration
- [ ] Create FAQ accordion with smooth animations
- [ ] Create final CTA section

### Phase 5: Components
- [ ] Design premium buttons (primary, secondary, outline, glow variants)
- [ ] Design card components with elevation and hover states
- [ ] Design form elements with focus states and validation
- [ ] Design table components for pricing comparison
- [ ] Design utility classes for spacing, typography, visibility

### Phase 6: Inner Pages
- [ ] Redesign pricing.html with comparison tables
- [ ] Redesign faq.html with search and accordion
- [ ] Redesign how-it-works.html with illustrated steps
- [ ] Redesign contact.html with form and map
- [ ] Redesign blog templates with article-focused typography
- [ ] Redesign procedure pages with service details

### Phase 7: Micro-interactions & Performance
- [ ] Add scroll-triggered animations (fade-in, slide-up, scale)
- [ ] Add hover states on all interactive elements
- [ ] Add focus-visible outlines for accessibility
- [ ] Add loading states for buttons and forms
- [ ] Optimize asset loading (preconnect, prefetch, lazy-load)
- [ ] Ensure all animations respect reduced motion preferences

### Phase 8: Verification & Polish
- [ ] Validate AAA contrast ratios throughout
- [ ] Test keyboard navigation and screen reader accessibility
- [ ] Verify responsive breakpoints (mobile, tablet, desktop)
- [ ] Test cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Measure and optimize performance (LCP, FID, CLS)
- [ ] Validate schema markup and SEO elements
- [ ] Final build and deployment

## Success Criteria
- Visual quality indistinguishable from premium marketing sites
- AAA WCAG compliance (contrast, keyboard navigation, screen reader)
- Sub-3 second load time on mobile 3G
- Zero console errors or warnings
- All custom SVGs load and render correctly
- Animations are smooth and purposeful
- Design system is fully documented and maintainable

## Dependencies to Keep
- Hugo Static Site Generator
- Leaflet.js (for clinic map - free, open-source)
- Google Fonts (Playfair Display, Inter, Outfit)
- Netlify Forms (for contact form - already configured)

## Files to Delete
- `website/themes/stack/` (entire theme directory)
- `website/assets/js/cost-calculator.js` (JS will be inline or in main.js)
- Any remaining theme-specific partials or overrides

## Estimated Effort
- Phase 1-2: 2-3 hours
- Phase 3-5: 4-5 hours  
- Phase 6-7: 3-4 hours
- Phase 8: 1-2 hours
- Total: 10-14 hours of focused work

This approach guarantees the premium quality you're seeking by eliminating all theme constraints and building everything specifically for the MedPup brand and conversion goals.