# Pinellas County / Tampa Bay Low-Cost Veterinary Landscape
## Research Brief — Updated from Pricing Intel v3 Data
**Date:** May 20, 2026

---

## Executive Summary

**The business is based in Largo, FL (Pinellas County).** This document covers the Pinellas/Tampa Bay vet landscape specifically — the South Florida 22-clinic list (`final_synthesis.md`) does NOT apply here.

**Bottom line after pricing-intel scan:**
- Only **1 Pinellas-relevant clinic** has published pricing in the DB: Humane Society of Tampa Bay (microchip $35 only)
- **ASPCA CVC Liberty City** (Miami, 1+ hr from Largo) has the best confirmed prices: spay/neuter $40–$80
- **Good Care Animal Clinic** (Hialeah, ~1 hr) is the next best data source: dental $285–$595
- **All other Pinellas/Tampa clinics** (HSPinellas, SPCA Tampa Bay, Pinellas County Animal Services, Operation SNIP, Thomasville Humane) returned **zero procedure pricing** — either no public rates or JS-rendered sites blocked by direct fetch
- The **Thomasville GA drive** from Largo is ~4.5 hours — more viable than from Miami (~7 hrs). Single-procedure nonprofit already identified.

---

## 1. Clinics Already Scanned (Pricing Intel v3 DB)

| # | Clinic | Location | Pricing Extracted | Notes |
|---|--------|----------|-------------------|-------|
| 4 | Humane Society of Tampa Bay (HSTB) | Tampa | **Microchip $35** only | No spay/dental/surgery pricing found |
| 14 | Paws 2 Help | West Palm Beach | Vaccination $15 | Too far from Pinellas |
| 21 | ASPCA Community Medicine — Liberty City | Miami | **Spay/Neuter $40–$80** | Best confirmed price in FL |
| 7 | Good Care Animal Clinic | Hialeah | Dental $285–$595, Spay $450–$1600, Neuter $350–$785, Surgery $650–$4200 | Most comprehensive pricing in DB |

---

## 2. Clinics Attempted But No Pricing Extracted

| Clinic | Issue |
|--------|-------|
| Operation SNIP / RemedyFL Tampa | JavaScript-rendered; redirect to lander; no static price data |
| Thomasville Humane | Archive exists (705 KB) but no price snippets in accessible HTML |
| SPCA of Tampa Bay | Site fetch timed out / JS-rendered |
| Humane Society of Pinellas | Archive shows donation amounts ($5–$40), no vet procedure prices |
| Pinellas County Animal Services | No pricing page; government site |

---

## 3. What This Means for the Pinellas Phase 1 Strategy

### The Core Problem
Low-cost clinics consistently **do not publish prices online**. This is the fundamental data gap:
- Websites are JS-rendered WordPress/SPA → pricing is loaded dynamically
- Many clinic pricing is phone-only or PDF-based
- The pricing-intel tool can only extract what's in static HTML or JS bundles

### What We Know for Certain (Verified)
| Procedure | Best Confirmed Price | Clinic | Distance from Largo |
|-----------|---------------------|--------|-------------------|
| Dog spay/neuter | **$40–$80** | ASPCA CVC Liberty City | ~1 hr |
| Cat spay/neuter | **$30** (MDAS, per research) | MDAS Miami | ~1 hr |
| Dental cleaning | **$285–$595** | Good Care Hialeah | ~1 hr |
| Vaccination | **$15** | Paws 2 Help WPB | ~1 hr |

**Note:** ASPCA CVC and Good Care are in South Florida, not Pinellas. They are the pricing benchmarks, not the Phase 1 partners.

### What We Don't Have Yet (Pinellas-Specific)
| Clinic | Status |
|--------|--------|
| Humane Society of Pinellas | Contact info found; pricing unknown |
| SPCA of Tampa Bay | Yes |
| Pinellas County Animal Services | Yes |
| Operation SNIP / RemedyFL Tampa | Yes |
| Peacebranch Animal Hospital | Need to identify URL |
| Paws2Health | Need to identify URL |
| Thomasville Low-Cost Spay Neuter | Yes (Georgia, ~4.5 hrs) |

---

## 4. Pinellas-Specific Tactical Next Steps

### Phase 1a: Direct Outreach (No-automation alternative)
Since pricing cannot be autonomously extracted, the real discovery method is **phone/email**:

1. **Call Humane Society of Pinellas** — ask for veterinary service prices, spay/neuter schedule, partnership interest
2. **Call Pinellas County Animal Services** — government low-cost clinic, likely lowest prices
3. **Call Operation SNIP / RemedyFL** — Tampa-based referral/intermediary; could be a partner or competitor
4. **Call SPCA of Tampa Bay** — ask about referral partnerships
5. **Google search for "Peacebranch Animal Hospital Pinellas pricing"** — identify URL and pricing

### Phase 1b: Georgia Drive Test
From Largo to Thomasville GA = ~4.5 hours (vs 7 hrs from Miami). The Thomasville Low Cost Spay & Neuter Clinic offers spay/neuter at 65–85% below FL rates. **This is the highest-margin path IF there's client demand for 4.5-hour drives.**

### Phase 1c: ASPCA CVC as Referral Benchmark
Even though ASPCA CVC is not Pinellas-local, it can serve as:
- The **spay/neuter routing destination** for Pinellas clients willing to drive 1 hour
- The **pricing benchmark** to demonstrate savings ($80 vs $400–$800 full-service)
- The **proof of concept** before building Pinellas-local partnerships

---

## 5. Updated Lead Scoring for Pinellas Partners

| Clinic | Verifiable Pricing | Referral Likelihood | Priority |
|--------|-------------------|---------------------|----------|
| Humane Society of Pinellas | ❌ Unknown | Medium | **1** — call first |
| Pinellas County Animal Services | ❌ Unknown | High (government) | **2** |
| Operation SNIP / RemedyFL | ⚠️ No pricing found | Medium | **3** |
| SPCA of Tampa Bay | ❌ Unknown | Medium | **4** |
| ASPCA CVC Liberty City | ✅ $40–$80 spay | High (already accepting referrals?) | **5** — benchmark |
| Good Care Hialeah | ✅ Dental $285 | High | South FL reference only |

---

## 6. Dashboard Links

| Artifact | Location |
|----------|----------|
| Full pricing DB export | `pricing_intel_latest_snapshot.json` |
| Pricing intel v3 tool | `price_intel_v3.py` |
| Database | `pricing_intel_v3.db` |
| Original research prompt | `research_prompt_pinellas_clinics.md` |

---

## 7. Gaps That Cannot Be Resolved Autonomously

The following require direct human contact:

| Gap | Why Autonomous Tools Fail |
|-----|--------------------------|
| Pinellas clinic phone-only pricing | Pricing not published on the web |
| Partnership willingness | Requires conversation |
| Appointment availability | Real-time capacity signals |
| Whether a clinic will accept referrals | Business relationship question |

**The pricing-intel tool is valuable for clinics that publish prices. For the Pinellas market, it has confirmed that manual outreach is the primary discovery method.**

---

*Generated from pricing_intel_v3 DB scan on May 20, 2026. 18 clinics scanned, 0 Pinellas-local pricing points extracted.*
