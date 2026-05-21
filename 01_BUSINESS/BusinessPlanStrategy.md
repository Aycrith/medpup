# MedPup Business Plan & Strategy

## Pinellas Phase 1 — Active. International Phase 3 — Research Deferred.

**Last updated:** May 20, 2026
**Status:** Pinellas coordination model is the active business. All international logistics (Cancún, Freeport) are Phase 3 research items — no capital deployed, no operational commitment.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Context](#2-market-context)
3. [Competitive Landscape & The MedPup Gap](#3-competitive-landscape--the-medpup-gap)
4. [Phase 1: Pinellas Coordination Model](#4-phase-1-pinellas-coordination-model)
5. [Phase 3: International Research (Condensed)](#5-phase-3-international-research-condensed)
6. [Execution Roadmap](#6-execution-roadmap)
7. [Manual Actions — Phone Calls Required](#7-manual-actions--phone-calls-required)
8. [Verified Pricing Data](#8-verified-pricing-data)

---

## 1. Executive Summary

MedPup is a Pinellas County-based veterinary coordination service. Phase 1 is domestic only: routing pet owners to verified low-cost clinics in South Florida and Tampa Bay. The business model is simple — a flat coordination fee of $25–$100 per client, paid directly by the pet owner, with no percentage splits and no capital investment required.

**Core offering:** MedPup finds the best available price for a pet's procedure across a network of verified low-cost clinics, provides a guaranteed all-in cost estimate (not just the marketing price), and covers any surprise if the final bill exceeds the confirmed range. The client pays the clinic directly for the procedure; MedPup is paid separately for coordination.

**Key numbers:**

| Metric | Value |
|--------|-------|
| Coordination fee | $25–$100 per client (flat, no % split) |
| Verified partners | 3 (ASPCA CVC, Good Care, HSTB) |
| Capital required to launch | $0 |
| Client drive time | 28–55 minutes from Largo |
| Savings vs full-service vet | 50–91% depending on procedure |

**Phase 1 is live now.** No international logistics, no foreign currency, no permits, no government filings.

---

## 2. Market Context

The U.S. veterinary affordability crisis is structural, not cyclical. The following data points define the opportunity:

- **Veterinary costs up 47% since 2020** (BLS data) — nearly double the general inflation rate over the same period.
- **53% of U.S. households** now own a pet (~71 million homes), adding ~4 million new dog-owning households since 2024.
- **41% of pet owners** report struggling to afford veterinary care.
- **26% are stressed about a bill of $250 or less** — the affordability threshold has collapsed.
- **Over 50% have forgone necessary vet care due to cost.**
- **The surprise bill is the real market gap — not price discovery.** Anyone can Google a $40 spay. The gap is knowing what the actual out-the-door cost will be before you show up.

The market is already voting with its feet: an estimated 36,670 dogs crossed from the U.S. into Mexico for veterinary care in 2025 (11.6% YoY increase). MexiVet Express handles ~80 pets/week via a single land-border shuttle. The demand for affordable alternatives is proven and growing.

Pet travel services globally are projected to grow from $2.25B (2025) to $3.68B by 2030 (CAGR 10.5%), reflecting a structural shift toward mobility with pets for health and lifestyle reasons.

---

## 3. Competitive Landscape & The MedPup Gap

### Existing Players

| Competitor | Model | Geography | What They Do | What They Don't Do |
|-----------|-------|-----------|-------------|-------------------|
| **MexiVet Express** | Land-border shuttle | San Diego ↔ Tijuana (West Coast only) | Full trip logistics, 15 staff, ~80 pets/week | No East Coast presence, no integrated financing |
| **FareVet** | AI price comparison | Nationwide (digital only) | Compares clinic prices by zip | No coordination, no booking, no all-in guarantee |
| **Independent Mexican clinics** (Vet Playas, etc.) | Direct client booking | Mexican border cities | Lowest procedure costs | No travel logistics, no U.S. coordination |
| **Operation SNIP** (Largo) | Direct low-cost clinic | Pinellas County | Spay/neuter $70–$100 | Local only, no referral network |

### The MedPup Gap

No competitor has built an East Coast-centric model that combines:

1. **Active price comparison** across verified low-cost clinics (not just a directory)
2. **All-in cost guarantee** that covers surprise bills (the real trust barrier)
3. **Flat-fee coordination** paid by the client, not subsidized by clinic kickbacks

FareVet tells you a marketing price. MedPup tells you the out-the-door range and guarantees it.

---

## 4. Phase 1: Pinellas Coordination Model

This is the active business. Phase 1 is domestic referral routing only.

### 4.1 Business Structure

- **Entity:** Florida LLC (MedPup Veterinary Concierge, LLC) — filed with Florida Department of State
- **Revenue model:** Flat coordination fee of $25–$100 per client, paid directly by the pet owner
- **Payment flow:** Client pays clinic directly for procedure. MedPup fee is separate and collected at time of routing
- **No percentage splits** — MedPup does not take a cut of clinic revenue
- **No inventory** — no drugs, no supplies, no equipment
- **Capital required: $0**

### 4.2 Verified Partner Clinics

| Partner | ID | Location | Drive from Largo | Key Procedures | Confirmed Pricing |
|---------|-----|---------|-----------------|----------------|-------------------|
| **ASPCA CVC Liberty City** | 21 | Miami | ~55 min | Spay/Neuter | $40–$80 (v3 confirmed) |
| **Good Care Animal Clinic** | 7 | Hialeah | ~55 min | Dental, Surgery | Dental $285–$595, Surgery $450–$1,600 (v3 confirmed) |
| **HSTB Tampa (T2)** | 4 | Tampa | ~28 min | Spay/Neuter, general services | T2 pricing; phone verification still pending for full list |

### 4.3 The All-In Cost Guarantee (Core Differentiator)

The marketing price ("$40 spay") is misleading. The actual out-the-door cost can be 2–4× higher after mandatory add-ons. MedPup solves this with a verifiable all-in estimate.

**How it works:**

1. **real_cost_calculator.py** applies a procedure-specific reality multiplier (2.0×–3.0× for spay/neuter, 2.0×–4.0× for dental) and lists all mandatory add-ons per category.
2. **route_engine.py** scores every clinic × procedure combo and returns a ranked route card with `allin_low` and `allin_high` fields.
3. **auto_quote.py** enriches each route card with the all-in guarantee sentence and renders a "MEDPUP ALL-IN COST GUARANTEE" box in client-facing output.
4. **price_guarantee.py** evaluates whether the final clinic bill exceeds the confirmed range. If it does, MedPup covers the excess from its coordination fee, or routes the client to a backup clinic at no cost.

**Surprise bill coverage logic (from price_guarantee.py):**

- If final bill ≤ confirmed high: no guarantee triggered.
- If excess ≤ coordination fee ($75 default): MedPup refunds the difference to the client (covered by fee).
- If excess > coordination fee: client routed to backup clinic at no additional cost; MedPup absorbs the fee and the difference.

This is the trust mechanism that separates MedPup from a Google search.

### 4.4 Tool Stack (All Built)

| Tool | File | Purpose |
|------|------|---------|
| Routing engine | `route_engine.py` | Scores clinics × procedures, ranks by composite score (price + travel + freshness) |
| Auto-quote | `auto_quote.py` | Takes client intake JSON, returns ranked route card with all-in guarantee |
| Price guarantee | `price_guarantee.py` | Evaluates surprise bills, triggers coverage or backup routing |
| Real cost calculator | `real_cost_calculator.py` | Applies reality multipliers, returns guaranteed min / possible max |
| Intake schema | `intake_schema.py` | Validates client intake JSON, saves to VOC tracking |
| Market expander | `market_expander.py` | Auto-discovers new Pinellas-area clinics via search + DB pipeline |

### 4.5 Unit Economics

The coordination fee model has straightforward unit economics since there is no inventory, no logistics cost, and no clinic markup.

| Scenario | Coordination Fee | Client Clinic Cost | MedPup Margin |
|----------|-----------------|-------------------|---------------|
| Spay/Neuter referral | $25–$50 | $40–$240 (all-in) | 100% (no COGS) |
| Dental referral | $50–$75 | $895–$3,710 (all-in) | 100% (no COGS) |
| Surgery referral | $75–$100 | $765–$4,800 (all-in) | 100% (no COGS) |

**Estimated monthly revenue at scale:**

| Clients/month | Avg fee | Revenue | Notes |
|--------------|---------|---------|-------|
| 5 | $50 | $250 | Minimal outreach |
| 20 | $50 | $1,000 | Active Facebook + clinic referrals |
| 50 | $50 | $2,500 | Steady pipeline from SEO + word of mouth |
| 100 | $50 | $5,000 | Full-time coordinator |

**Cost structure:** $0 cost of goods sold. Only costs are the coordinator's time, phone/email, and website hosting (~$15–$30/mo for a static Hugo site).

### 4.6 Operation SNIP — Status: Deferred (Phone Call Required)

Operation SNIP (Largo, clinic_id 2, 3 min from base) offers spay/neuter at $70–$100 (confirmed via reviews). However, their position as a competitor vs. potential partner is unknown. A phone call is required before any email outreach. See Section 7.

---

## 5. Phase 3: International Research (Condensed)

Both the Cancún and Freeport models were researched as potential Phase 1 launch strategies. **Neither is viable as Phase 1.** Both are deferred to Phase 3 with no capital deployed.

### 5.1 Freeport, Grand Bahama — "Pharmacy Ferry" Model

**Researched outcome:** The 3-hour Balearia Caribbean ferry from Fort Lauderdale to Freeport is operational and pet-friendly. The Hawksbill Creek Agreement provides a Free Trade Zone with no taxes on income/capital gains/duties until 2054. USDA APHIS health certificates for the Bahamas do not require endorsement — a genuine cost advantage.

**Why it failed as Phase 1:** MedPup cannot confirm partner clinic surgical capability or pricing without phone calls to Freeport Veterinary Hospital. No pricing data was obtained via web scraping, JS bundle extraction, or API. The model requires confirmed CareCredit acceptance at the Bahamian clinic and verified procedure pricing before any client can be routed.

**Status:** Phase 3 deferred. Revisit only after (1) a phone call to Freeport Veterinary Hospital confirms pricing and CareCredit acceptance, and (2) Phase 1 Pinellas model is generating revenue.

### 5.2 Cancún, Mexico — "Surgical Shuttle" Model

**Researched outcome:** VetCancun has confirmed high surgical capability (orthopedics, soft tissue, advanced diagnostics) with consultation pricing of $15–$30 USD extracted from a JS bundle. The clinic's service pages confirm TPLO, IVDD, oncology, and BOAS capability.

**Why it failed as Phase 1:** Even at a $900–$1,500 concierge fee, the unit economics are negative to thin when factoring in charter flights, recovery villa accommodation, screwworm certificate coordination ($40–$80), USDA endorsement, and 24/7 concierge staff. A 6-pet Cancún trip yields ~$1,910 net profit ($318/pet) — compared to $2,225 net for a 5-pet Freeport day trip ($445/pet). And both require confirmed surgical pricing, which MedPup does not have for either destination.

**Additional barrier:** Screwworm rule (Mexico affected as of November 22, 2024) requires Mexican vet inspection within 5 days of return. CareCredit is not accepted in Mexico, eliminating the financing bridge that makes Freeport attractive.

**Status:** Phase 3 deferred. Cancún may become viable if (1) surgical pricing is confirmed via email/phone, (2) a white-labeled installment loan product is developed, and (3) the Pinellas model provides sufficient revenue to fund a pilot trip.

---

## 6. Execution Roadmap

### Phase 1: Pinellas Referral Routing (NOW — Active)

| Task | Status | Owner |
|------|--------|-------|
| Florida LLC formation | Ready to file | User |
| Verify ASPCA CVC pricing | ✅ Confirmed v3 | Agent |
| Verify Good Care pricing | ✅ Confirmed v3 | Agent |
| Verify HSTB pricing | ✅ DB confirmed | Agent |
| Build route_engine.py | ✅ Done | Agent |
| Build auto_quote.py | ✅ Done | Agent |
| Build price_guarantee.py | ✅ Done | Agent |
| Build real_cost_calculator.py | ✅ Done | Agent |
| Build intake_schema.py | ✅ Done | Agent |
| Build market_expander.py | ✅ Done | Agent |
| Outreach scripts written | ✅ 4 scripts ready | Agent |
| Call Operation SNIP (phone) | ⏳ Deferred — needs user call | User |
| Call ASPCA CVC (phone) | ⏳ Needs user call | User |
| Call Good Care (phone) | ⏳ Needs user call | User |
| Call HSTB (phone) | ⏳ Needs user call | User |
| Set up hello@medpup.com | ⏳ Google Voice / Zoho | User |
| Facebook test posts | ⏳ Test A / Test B | User |
| First client routed | ⏳ After above | Joint |

### Phase 2: Local Clinic Expansion (Next — After Phase 1 Revenue)

- Add 5–10 more Pinellas County clinics to the verified network
- Extend drive radius to Hillsborough County (Tampa) and Pasco County
- Build referral relationships with general practice vets who can't accommodate low-income clients
- Implement automated post-service review collection
- Optimize SEO for "low cost vet Pinellas," "affordable spay Tampa Bay," etc.

### Phase 3: Cancún / Freeport International (Deferred — No Timeline)

- Revisit only if Phase 1 is generating consistent revenue and market conditions change
- Required before launch: confirmed surgical pricing via phone/email for at least one partner clinic per destination
- Required before Cancún launch: white-labeled installment loan product for clients without CareCredit access

---

## 7. Manual Actions — Phone Calls Required

The following actions are **user-executed, not agent-executed.** The agent cannot make phone calls or send emails from user accounts. Each call closes a critical data gap.

### Call 1: Operation SNIP — (727) 327-7647

**Clinic:** Operation SNIP, 13489 Walsingham Rd, Largo (3 min from base)
**Gap:** Competitor vs. partner status unknown. Pricing confirmed at $70–$100 for spay/neuter (from reviews), but no referral relationship exists.
**Ask:** "Do you accept referred clients? Can I send you pre-qualified clients who need spay/neuter? I charge them a flat coordination fee — no cost to you."
**If yes:** Add to verified partner list, write outreach email.
**If no or hostile:** Flag as competitor, exclude from routing.

### Call 2: ASPCA CVC Liberty City — (305) 329-4922

**Clinic:** ASPCA Community Veterinary Clinic, 901 NW 27th Ave, Miami
**Gap:** Spay price $40–$80 is confirmed from scraped data (v3), but pricing freshness needs verification. Weekly referral capacity unknown.
**Ask:** "Is the $40–$80 spay/neuter price still current? How many appointments can you accommodate per week from referred clients?"
**Outcome:** Confirms or updates spay pricing in DB.

### Call 3: Good Care Animal Clinic — (305) 631-2022

**Clinic:** Good Care Animal Clinic, 6050 W 12th Ave, Hialeah
**Gap:** Dental $285–$595 and surgery $450–$1,600 are confirmed (v3), but appointment lead time and capacity are unknown.
**Ask:** "Are your dental and surgery prices still current? What's the typical appointment lead time for a new client?"
**Outcome:** Confirms dental/surgery pricing and booking window.

### Call 4: HSTB Tampa — (813) 935-0482

**Clinic:** Humane Society of Tampa Bay (T2), 3607 N Armenia Ave, Tampa
**Gap:** T2 pricing is in DB but may not reflect current rates. Pinellas residency eligibility for certain programs is unknown.
**Ask:** "What are your current spay/neuter prices? Do you serve Pinellas County residents, or are you Hillsborough-only?"
**Outcome:** Confirms spay/neuter pricing and eligibility rules.

---

## 8. Verified Pricing Data

All pricing below is sourced from the `pricing_intel_v3.db` database and verified via web scraping, JS bundle extraction, or Wayback Machine archival. No pricing is assumed.

### Pinellas County / Tampa Bay Low-Cost Options

| Clinic | Procedure | Price | vs FL Full-Service | Data Source |
|--------|-----------|-------|-------------------|-------------|
| **SPOT** (Pinellas Park) | Cat neuter | $35 | 82–91% savings | Published pricing |
| **SPOT** | Dog spay (by weight) | $45–$90 | 80–89% savings | Published pricing |
| **Operation SNIP** (Largo) | Dog spay | $70–$100 | 75–87% savings | Reviews (phone call pending) |
| **Animal Coalition of Tampa** | Dental cleaning | $150 | 68–84% savings | Reviews (phone call pending) |
| **Pinellas Voucher** (Largo) | Spay/neuter | $0 | 100% savings | Government program |
| **SPCA Tampa Bay** | Spay/neuter | $80+ | 80%+ savings | Published pricing |

### South Florida Verified Partners

| Clinic | ID | Procedure | Price Low | Price High | Confidence |
|--------|------|-----------|-----------|-----------|-----------|
| ASPCA CVC Liberty City | 21 | Spay/Neuter | $40 | $80 | High (v3) |
| Good Care Animal Clinic | 7 | Dental Cleaning | $285 | $595 | High (v3) |
| Good Care Animal Clinic | 7 | Surgery | $450 | $1,600 | High (v3) |
| HSTB Tampa | 4 | Spay/Neuter | T2 pricing | T2 pricing | Medium (phone call pending) |

### Cancún (Phase 3 — Research Only, No Pricing Confirmed)

| Clinic | Service | Price (USD) | Source |
|--------|---------|------------|--------|
| VetCancun | Consultation | $15–$30 | JS bundle (FAQ) |
| VetCancun | Vaccinations | $10–$20 | JS bundle (FAQ) |
| VetCancun | Surgery (general) | Not confirmed | Capability confirmed from service pages |
| VetCancun | Dental | Not confirmed | Capability confirmed |

### Freeport (Phase 3 — Research Only, No Pricing Confirmed)

| Clinic | Service | Price | Source |
|--------|---------|-------|--------|
| Freeport Veterinary Hospital | All procedures | Not confirmed | No data obtained; phone call required |

---

## Appendix: Tool Reference

All tools live in `C:\Users\camer\DEVNEW\AnimalAid\`:

- **`route_engine.py`** (240 lines) — Scores every clinic × procedure combination from the SQLite DB, ranks by composite score (60% price, 40% travel), returns route cards with all-in cost fields.
- **`auto_quote.py`** (174 lines) — Consumes client intake JSON, runs route_engine, returns a human-readable or machine-readable route card with the MEDPUP ALL-IN COST GUARANTEE box.
- **`price_guarantee.py`** (83 lines) — Evaluates final bill against confirmed all-in range; triggers fee-refund or backup-clinic routing if excess is found.
- **`real_cost_calculator.py`** (148 lines) — Applies reality multipliers (2.0×–4.0× depending on procedure) and lists mandatory add-ons per category. Returns guaranteed_min and possible_max.
- **`intake_schema.py`** — Validates client intake, saves to `02_PHASES/voc/` for VOC tracking.
- **`market_expander.py`** (224 lines) — Auto-discovers new Pinellas-area clinics via DuckDuckGo search, scans candidates through the pricing intel pipeline, writes results to DB.

---

*This document replaces the previous dual-hub international business plan. The Cancún and Freeport models are preserved as Phase 3 research items but are not part of the active business. No capital has been deployed internationally. Phase 1 Pinellas is the operating strategy.*
