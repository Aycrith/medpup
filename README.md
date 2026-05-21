# MedPup Veterinary Concierge

**Phase 1 — Pinellas County, Florida (Domestic)**

MedPup is a veterinary logistics coordination service — not a veterinary practice. We connect Pinellas County pet owners with the lowest-cost licensed clinic within driving distance, confirm the **all-in cost before they book**, and if the final bill exceeds the confirmed range we cover the excess or route to a backup clinic at no cost.

**Current Phase 1 model:**
- ASPCA Community Veterinary Clinic (Liberty City / Miami) — $40–$80 for spay/neuter
- Good Care Animal Clinic (Hialeah) — $285–$595 for dental, surgery from $650
- Harmony Vet Care (Oldsmar, Brandon, Tampa) — spay/neuter $85–$180, dental from $300+
- Flat coordination fee: $25–$100 per client (not a markup; paid separately)
- Savings vs. U.S. average: **80–95%** for spay/neuter; **60–85%** for dental/surgery

---

## Repository Structure

```
medpup/
├── KNOWLEDGE_BASE.json              # Machine-readable business & market data
├── 01_BUSINESS/                     # Core business strategy & planning
│   ├── BusinessPlanStrategy.md      # Full business plan, dual-hub model, unit economics
│   ├── QuickStartExecutionGuide.md  # Zero-to-first-booking in 7 days
│   ├── AgentCapabilityGapAnalysis.md# Complete inventory of legal, regulatory, & capability needs
│   └── AgentBusinessSkills.md       # Zero-cost open-source tech stack configuration guide
├── 02_PHASES/                       # Phase-by-phase execution playbooks
│   ├── Phase01_FoundationalBusinessAssets.md
│   ├── Phase02_DigitalInfrastructure.md
│   ├── Phase02_PilotTripAssets.md
│   ├── Phase02_PreLaunchPrep.md
│   ├── Phase03_FinancialDashboard.md
│   ├── Phase03_OperationalPreFlightChecklist.md
│   ├── Phase03_PartnerOutreach.md
│   ├── Phase03_SocialMediaLaunchKit.md
│   ├── Phase03_VetReferralOutreach.md
│   ├── Phase04_LaunchWeekActionPlan.md
│   └── Phase05_ScalingAndGrowth.md
├── 03_RESEARCH/                     # 23 deep-dive research documents
│   ├── 00_MasterIndex.md            # Research directory index
│   ├── 01_VeterinaryCostCrisis.md   # The affordability crisis in U.S. vet care
│   ├── 02_CrossBorderPetMedicalTourism.md
│   ├── 03_FloridaTargetMarket.md
│   ├── ... (20 more research docs)
│   └── ResearchConversation.md      # Full research conversation log
├── 04_ARCHIVE/                      # Prior work & historical reference
│   ├── florida-animal-aid-project-v0/  # Original Phase 0 research project
│   └── florida_animal_aid_access_project_phase0.zip
└── assets/
    └── images/                      # Brand previews & mockup screenshots
```

## Phase 1 Pipeline (Active)

**Goal:** First paying client booked within 7 days. Tools already built, tested, and verified.

```
Client inquiry → intake_schema.py → auto_quote.py → route card → client confirms → BOOK IT → price_guarantee.py → appointment
```

**Pricing engine:** 185 verified price records across 24 clinics. TTL-based freshness monitor runs daily.

**Market data:** Verified 2026 prices from ASPCA CVC, Good Care Animal Clinic, Harmony Vet Care (3 locations), SPOT Spay/Neuter Clinic, and 19+ additional clinics in `pricing_intel_v3.db`.

**Website:** Hugo static site (Stack theme), 225 pages. Build: `cd website && hugo --minify`.

**Tech stack:** Zero-cost only — Hugo, GitHub Pages, Python. Full inventory at `01_BUSINESS/AgentBusinessSkills.md`.

## Market Context

- Veterinary costs have risen **47.15% since 2020** — nearly double general inflation
- **53% of pet owners** say a $500–$2,500 vet bill is "impossible" to pay
- **Over 50%** have forgone necessary vet care due to cost
- Pet insurance penetration: only **4.6%** of households
- Global pet travel services market: **$2.25B (2025) → $3.68B (2030)**, CAGR 10.5%

## Tech Stack

This business is designed to be built and operated with **zero-cost open-source tools**:

| Function | Tool | Cost |
|----------|------|------|
| Website | Hugo + GitHub Pages | $0 |
| CRM | EspoCRM (self-hosted) | $0 |
| Automation | n8n (self-hosted) | $0 |
| Live Chat | Chatwoot | $0 |
| E-Signatures | OpenSign | $0 |
| Invoicing | Invoice Ninja | $0 |
| Analytics | Umami | $0 |
| Design | Inkscape + Penpot | $0 |

Full details in `01_BUSINESS/AgentBusinessSkills.md`.

## Getting Started

The **Quick Start Guide** (`01_BUSINESS/QuickStartExecutionGuide.md`) strips everything down to a 5-step sprint to get the first paying client booked within 7 days.

**Priority sequence:**
1. Read the **Business Plan Strategy** for full context
2. Follow the **Quick Start Guide** for immediate action
3. Deploy Phase 2 digital infrastructure (Hugo site + CRM + automation)
4. Execute Phase 3 partner outreach, marketing, and operational setup
5. Launch with the Phase 4 Launch Week Action Plan
6. Scale via Phase 5 growth playbook

## Legal Status

MedPup operates as a **Management Services Organization (MSO)** paired with a Florida Professional Corporation (PC) owned by a licensed veterinarian, in compliance with Florida Statute 474.201 (Corporate Practice of Veterinary Medicine). All medical decisions remain the sole purview of the licensed, independent partner veterinarian.

---

*This repository contains the complete foundational planning and execution documentation for the MedPup business. It is designed to be parsed and executed by autonomous AI agents with human oversight at critical legal and strategic gates.*
