# MedPup — Autonomous Execution Plan
## Verified 2026 Market Data → Real Business

**Last updated:** May 20, 2026
**Execution mode:** AI-agent autonomous (tasks marked [AUTO]) with human gates (tasks marked [HUMAN])
**Capital required:** $0 until first revenue

---

## Overview

This plan builds MedPup as a two-tier business based on verified primary-source data:

| Tier | Model | Fee | Target Procedure | Revenue Potential |
|------|-------|-----|-----------------|-------------------|
| 1 | Domestic coordination (Pinellas → South FL) | $25–$100/client | Spay, dental, basic surgery | $2,500–$10,000/yr (part-time) |
| 2 | Cancun surgical concierge | $1,500–$2,500/client | TPLO, spinal, oncology | $48,000–$90,000/yr (2-3/mo) |

The plan is structured so Tier 1 revenue funds Tier 2 buildout. No outside capital needed.

---

## Phase 1: Business Foundation [AUTO]

**Goal:** Create all legal, operational, and branding assets so the business can operate professionally from day one.

### 1.1 Legal Documents [AUTO]
- [ ] Client Service Agreement — $25–$100 coordination fee, all-in cost guarantee, liability waiver
- [ ] Privacy Policy (GDPR-compliant, CCPA-compliant)
- [ ] Terms of Service
- [ ] Release of Liability waiver for coordination services
- [ ] Intake form template (pet info, procedure, US quote, contact)

### 1.2 Client-Facing Documents [AUTO]
- [ ] Welcome packet (what to expect, pre-appointment checklist)
- [ ] Post-procedure follow-up template
- [ ] Route card template (the all-in cost guarantee output that clients see)
- [ ] Free consultation script (email template)

### 1.3 Pricing Framework [AUTO]
- [ ] Publish verified price table for Phase 1 clinics
- [ ] Build the "all-in cost guarantee" into every client-facing document
- [ ] Document the hidden-add-on multiplier methodology (real_cost_calculator.py)

### 1.4 Website Hardening [AUTO]
- [x] Hugo site builds clean (184 pages, 0 errors)
- [x] Phase 1 messaging across homepage, pricing, how-it-works
- [x] Freeport/Cancun pages set to render: never
- [ ] Add structured data (LocalBusiness, VeterinaryCare schema)
- [ ] Add contact form with intake schema integration
- [ ] Add sitemap.xml configuration
- [ ] Add "MedPup All-In Cost Guarantee" badge visible site-wide

### 1.5 Brand Assets [AUTO]
- [ ] Business email signature template
- [ ] Social media profile photo (professional, simple)
- [ ] Elevator pitch (1-sentence, 30-second, 2-minute versions)

---

## Phase 2: Booking & Operations Pipeline [AUTO]

**Goal:** Every client inquiry generates a route card automatically. No manual work per lead.

### 2.1 Auto-Quote Engine Hardening
- [x] real_cost_calculator.py — applies procedure-specific multipliers (2.0×–3.0×)
- [x] price_guarantee.py — evaluates final bill vs confirmed range
- [x] route_engine.py — ranked clinic options with allin_low/allin_high
- [x] auto_quote.py — builds route card with MEDPUP ALL-IN COST GUARANTEE box
- [x] intake_schema.py — validates intake JSON, saves to 02_PHASES/voc/
- [ ] **Test:** Run auto_quote.py with sample input → verify output is correct
- [ ] **Test:** Route 3 mock clients through the full pipeline
- [ ] Fix any pipeline bugs

### 2.2 Client Intake System
- [ ] Build the intake form content (markdown version for website)
- [ ] Create the intake-to-route-card workflow document
- [ ] Build the VOC (Verified Options Cache) reader script

### 2.3 Market Expander
- [x] market_expander.py exists
- [ ] Run market_expander.py to discover ALL Pinellas clinics within 60 miles
- [ ] Score each clinic: price available (verified/call required/unavailable)
- [ ] Priority: find 5+ more clinics with published pricing (no call needed)

### 2.4 Pricing Freshness Monitor
- [x] pricing_intel_v3.db exists
- [ ] Build honeypot_run.py (stale pricing detector)
- [ ] Set TTL: 90 days for published prices, 60 days for estimated, 7 days for call-verified
- [ ] Create pricing_alerts.json integration

---

## Phase 3: Partner Clinic Network Expansion [AUTO + HUMAN GATES]

**Goal:** Grow from 2 verified partners to 10+ without phone calls where possible.

### 3.1 Autonomous Clinic Discovery [AUTO]
- [ ] Search Florida veterinary board for licensed clinic roster
- [ ] Cross-reference against pricing_intel_v3.db for matches
- [ ] Use price_intel_engine.py to scan discovered clinic websites for pricing
- [ ] Wayback Machine fallback for Cloudflare-blocked sites
- [ ] Build ranked shortlist: clinics with extractable pricing → move to verified

### 3.2 Price Intel Engine Improvements [AUTO]
- [ ] Fix false positive filtering (React internal code, $1 values)
- [ ] Add extraction patterns for more clinic website types
- [ ] Add human-readable report export
- [ ] Build clinic pricing report card format

### 3.3 Phone-Call Queue [HUMAN] — Deferred
The following require human phone calls and are queued for when you're ready:
- [ ] Operation SNIP (727) 327-7647 — competitor or partner?
- [ ] ASPCA CVC (305) 329-4922 — confirm current pricing + capacity
- [ ] Good Care Animal Clinic (305) 631-2022 — confirm pricing + lead time
- [ ] HSTB (813) 935-0482 — spay/neuter pricing
- [ ] Any "call required" clinics from market_expander.py discoveries

---

## Phase 4: Marketing & Demand Capture [AUTO + HUMAN GATES]

**Goal:** Create a system that generates inquiries without paid advertising.

### 4.1 Content Foundation [AUTO]
- [ ] Write 5 core SEO blog posts targeting high-intent keywords:
  1. "TPLO surgery cost Florida 2026 — how to save 50-80%"
  2. "Dog dental cleaning cost Tampa Bay — all-in pricing guide"
  3. "Low-cost spay/neuter Pinellas County — verified prices"
  4. "Pet surgery financing options — what nobody tells you"
  5. "Cross-border pet surgery — Cancun concierge guide"
- [ ] Publish each as a Hugo blog post on the website

### 4.2 Social Proof Framework [AUTO]
- [ ] Build review collection template (post-appointment)
- [ ] Create "before/after savings" comparison template
- [ ] Draft Google Business Profile description (Phase 1 messaging)

### 4.3 Facebook Test Posts [HUMAN] — When Ready
- [ ] Test A: Price frame ("save $1,200 on dental")
- [ ] Test B: Guarantee frame ("confirmed price before you book")
- Drafts are ready at 02_PHASES/Phase1_FacebookTestPost.md

### 4.4 SEO & Local Presence [AUTO]
- [ ] Add VeterinaryCare schema to website pricing page
- [ ] Add LocalBusiness schema to contact page
- [ ] Generate sitemap.xml
- [ ] Research Google Business Profile setup requirements

---

## Phase 5: Cancun Surgical Concierge Tier [AUTO → HUMAN]

**Goal:** Build the high-ticket pipeline. Self-funded through Tier 1 revenue.

### 5.1 Supply-Side Vetting [AUTO]
- [ ] VetCancun: research complete contact info (email, WhatsApp)
- [ ] CAP Cancun: research complete contact info
- [ ] Build Cancun clinic comparison matrix (services, English, pricing, travel certs)
- [ ] Research: direct flights FLL-CUN pet policies for ALL airlines (not just 4)
- [ ] Research: pet-friendly hotels near Zona Hotelera with 25kg+ capacity
- [ ] Build Cancun route cost calculator (dynamic — airfare fluctuates)

### 5.2 Pricing & Margin Model [AUTO]
- [ ] Build Cancun per-procedure margin calculator
- [ ] Confirm break-even per trip at $1,500/$2,000/$2,500 fee levels
- [ ] Create client-facing Cancun route card template
- [ ] Build Cancun-specific price_guarantee.py extension

### 5.3 Regulatory Research [AUTO]
- [ ] Complete Mexico import requirements checklist
- [ ] CDC dog import requirements (Mexico is NOT high-risk)
- [ ] USDA APHIS endorsement for Mexico return
- [ ] Screwworm certificate requirements (mandatory since Nov 2024)
- [ ] Build "Pre-Trip Document Checklist" template

### 5.4 First Pilot Trip [HUMAN] — Only After Tier 1 Revenue
- [ ] Contact VetCancun or CAP Cancun via email/WhatsApp
- [ ] Confirm they accept international US clients
- [ ] Get written pricing for 3 procedures
- [ ] Confirm English-speaking staff
- [ ] Book first client at full $2,000 fee

---

## Phase 6: Revenue Operations & Scaling [AUTO → HUMAN]

**Goal:** Make the business run without you in the loop for routine operations.

### 6.1 SOP Documentation [AUTO]
- [ ] Write Standard Operating Procedure for:
  - Client intake → route card → booking
  - Post-procedure follow-up
  - Price guarantee claim handling
  - Clinic relationship management

### 6.2 Financial Tracking [AUTO]
- [ ] Build revenue tracker (Google Sheets template or local CSV)
- [ ] Build expense tracker
- [ ] Create monthly P&L template
- [ ] Document tax implications (1099-NEC for coordination fees)

### 6.3 Growth Playbook [AUTO]
- [ ] Document the "add 5 clinics" playbook (repeatable expansion)
- [ ] Document the "Cancun pilot" playbook (repeatable for new destinations)
- [ ] Build the "referral partner" outreach template (for US vets)

---

## Immediate Execution [AUTO — STARTING NOW]

I can execute the following **right now, autonomously**, with no input from you:

| # | Task | Phase | Est. Time |
|---|------|-------|-----------|
| 1 | Draft Client Service Agreement | 1.1 | 30 min |
| 2 | Draft Privacy Policy & Terms of Service | 1.1 | 20 min |
| 3 | Draft Welcome Packet & Intake Form | 1.2 | 20 min |
| 4 | Add schema markup to website | 1.4 | 15 min |
| 5 | Run auto_quote.py end-to-end test | 2.1 | 10 min |
| 6 | Run market_expander.py for new clinics | 2.3 | 20 min |
| 7 | Write 5 SEO blog posts | 4.1 | 45 min |
| 8 | Build Cancun margin calculator | 5.2 | 20 min |
| 9 | Write Cancun pre-trip checklist | 5.3 | 15 min |
| 10 | Build SOP documents | 6.1 | 30 min |

**Total: ~3.5 hours of autonomous execution.**

Tasks requiring you (phone, spending, or posting) are deferred until you approve.

---

*This plan is built on verified 2026 data. Every margin number is sourced. Every assumption is labeled. See `verified_2026_market_analysis.md` for the full data appendix.*
