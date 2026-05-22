# AAA Website Transformation Plan

**Goal:** Transform MedPup Hugo site to AAA world-class quality, competitive with Chewy.com  
**Last updated:** May 22, 2026  
**Benchmark:** Chewy.com (WCAG AAA, 95+ Lighthouse, sub-2.5s load times)

---

## Current Site Analysis

### Screenshot Summary
- Dark mode, solid dark charcoal background
- Two-column layout: left narrow sidebar navigation, right wide main content area
- Built with Hugo Stack theme, 12 content pages

### Confirmed Gaps vs AAA Criteria
1. No verified WCAG AAA compliance (contrast, keyboard nav, screen reader)
2. Sidebar navigation not mobile-optimized, hides key CTAs
3. Value proposition (all-in cost guarantee) not confirmed above the fold
4. Missing trust signals: partner badges, testimonials, guarantee text
5. No interactive tools (cost calculator, clinic map)
6. Unclear conversion path: no prominent "Book Now" buttons

---

## Target Benchmark: Chewy.com Parity

Chewy.com sets the standard for pet-focused AAA sites:
- Full WCAG AAA accessibility compliance
- High-contrast, consistent branding, intuitive navigation
- Prominent value proposition, seamless 3-click conversion flow
- Rich media, verified reviews, 100% mobile responsiveness
- Sub-2.5s page load times (LCP), 95+ Lighthouse scores

---

## Transformation Phases

### Phase 1: Audit & Benchmarking (Days 1-2)
*Tools: pre-launch-audit skill, visual-preview skill, axe, lighthouse*

1. Run pre-launch-audit skill for full static site checklist
2. Capture desktop/mobile/tablet screenshots with visual-preview skill
3. Audit WCAG AAA compliance (contrast ratios, keyboard nav, screen reader)
4. Document all gaps vs Chewy.com benchmark
5. Output: `docs/plans/audit_report.md`

### Phase 2: Design System Overhaul (Days 3-5)
*Tools: content-site-builder skill, comfyui skill*

1. Customize Hugo Stack theme to MedPup brand guidelines
2. Validate all text/background contrast ratios meet AAA standards:
   - Normal text: 7:1 minimum
   - Large text: 4.5:1 minimum
3. Replace generic hero images with high-quality pet/vet care imagery
4. Standardize CTA styling:
   - Primary: "Book Now" (brand orange #FF6B35)
   - Secondary: "Contact Us" (white #FFFFFF)
5. Follow content-site-builder skill steps for Hugo customization

### Phase 3: UX Optimization (Days 6-8)
*Tools: maps skill, content-site-builder skill*

1. Restructure navigation: collapse sidebar to top nav with mobile hamburger menu
2. Place all-in cost guarantee above the fold on homepage
3. Add interactive cost calculator pulling from `KNOWLEDGE_BASE.json`
4. Embed partner clinic map using maps skill (OpenStreetMap/Google Maps)
5. Add trust section: partner badges, testimonials, guarantee terms

### Phase 4: Content & SEO (Days 9-11)
*Tools: KNOWLEDGE_BASE.json, marketing keywords*

1. Optimize 12 content pages for EEAT:
   - Add vet-authored bylines
   - Link to primary sources (USDA, CDC, MarketWatch)
2. Add schema markup: LocalBusiness, Service, Review types
3. Expand FAQ page to 50+ questions from marketing section
4. Add video testimonial thumbnails (hyperframes skill for embedded players)

### Phase 5: Performance & Accessibility (Days 12-14)
*Tools: hugo --minify, axe, screen readers*

1. Convert all images to WebP, add lazy loading
2. Validate minified CSS/JS output from `hugo --minify`
3. Test keyboard navigation: tab order, focus states, skip links
4. Test screen reader compatibility (NVDA/VoiceOver)
5. Fix 100% of WCAG AAA violations

### Phase 6: Testing & Launch (Days 15-16)
*Tools: pre-launch-audit skill, Netlify*

1. Cross-browser test: Chrome, Firefox, Safari (desktop + mobile)
2. Run final pre-launch-audit checklist
3. Deploy to Netlify via drag-and-drop of `website/` folder
4. Monitor Lighthouse scores post-deploy (target 95+)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| WCAG AAA violations | 0 |
| Lighthouse performance score | 95+ |
| Mobile-friendly test | 100% pass |
| Conversion rate (landing to inquiry) | 5%+ |
| Page load LCP | < 2.5 seconds |
| Page load CLS | < 0.1 |

---

## Skill References
- content-site-builder: Hugo site customization from planning docs
- pre-launch-audit: Full static site pre-deployment checklist
- visual-preview: WebGL-enabled screenshots for visual verification
- maps: Embed clinic maps with OpenStreetMap/Google Maps
- comfyui: Generate custom hero imagery and video thumbnails
