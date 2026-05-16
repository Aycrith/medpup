# MedPup — Pet Medical Concierge

A Florida-based veterinary concierge service that connects pet owners with affordable, high-quality surgical care at pre-vetted international clinics. **MedPup is a logistics concierge, not a veterinary practice.** We organize small-group trips to accredited partner clinics in Freeport, Grand Bahama and Cancun, Mexico — saving pet owners 50–80% on the same procedures quoted in the U.S.

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

## The Dual-Hub Model

### Freeport, Grand Bahama — "The Pharmacy Ferry"
- **Travel:** 3-hour passenger ferry from Fort Lauderdale (Balearia Caribbean)
- **Use case:** Chronic medication runs, dental, mass removals, Tier 2 orthopedics
- **Savings:** 50–80% vs. U.S. prices
- **Key advantage:** CareCredit accepted directly at partner clinic. No USDA endorsement or screwworm certificate required.
- **Concierge fee:** $900/pet | **Trip margin:** 49%

### Cancun, Mexico — "The Surgical Shuttle"
- **Travel:** 1.5-hour group charter flight from Miami
- **Use case:** Complex orthopedics (TPLO, IVDD), oncology, BOAS, advanced diagnostics
- **Savings:** 60–80% vs. U.S. prices
- **Key advantage:** Board-certified surgeons, advanced imaging, proven cross-border volume (36,670+ dogs crossed in 2025)
- **Concierge fee:** $1,500/pet | **Trip margin:** 21%

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
