# MedPup Project Learnings

**Last updated:** May 22, 2026  
**Compiled from:** Memory entries, KNOWLEDGE_BASE.json, BusinessPlanStrategy.md, QuickStartExecutionGuide.md, and operational experience.

---

## 1. Core Business Model Learnings

### 1.1 Active Model (Phase 1)
- **Focus:** Pinellas County/Largo-based domestic coordination only (no international logistics yet)
- **Revenue:** Flat $25–$100 coordination fee per client, paid directly by pet owner
- **No splits:** No percentage cuts from clinic revenue
- **Capital required:** $0 to launch
- **Key advantage:** All-in cost guarantee (covers surprise bills exceeding confirmed range)

### 1.2 Verified Partners (Phase 1)
| Partner | Location | Drive from Largo | Key Procedures | Confirmed Pricing |
|---------|-----------|------------------|----------------|-------------------|
| ASPCA CVC Liberty City | Miami | ~55 min | Spay/Neuter | $40–$80 |
| Good Care Animal Clinic | Hialeah | ~45 min | Dental, Soft Tissue | $150–$350 |
| Humane Society of Tampa Bay | Tampa | ~28 min | Spay/Neuter, Vaccines | $70–$120 |

### 1.3 International Research (Phase 3 - Deferred)
- **Freeport, Bahamas:** 3hr ferry from Fort Lauderdale, tax-free (Hawksbill Creek Agreement until 2054), CareCredit accepted
- **Cancun, Mexico:** 1.5hr flight, 60–80% cost savings, USDA endorsement required
- **No capital deployed** for international operations currently

---

## 2. Market & Data Learnings

### 2.1 Affordability Crisis
- Vet costs up 47% since 2020 (6.65% annual vs 3.92% general inflation)
- 53% of US households own pets (~77.5M homes)
- Over 50% have forgone necessary vet care due to cost
- 53% of owners say a $250–$2500 vet bill is impossible
- Only 4.6% of pet owners have insurance

### 2.2 Cross-Border Demand
- 36,670 dogs crossed US-Mexico border for vet care in 2025 (+11.6% YoY)
- MexiVet Express handles ~80 pets/week via San Diego-Tijuana shuttle
- East Coast gap: No proven cross-border coordinator for Florida-Bahamas/Mexico routes

### 2.3 Cost Comparison (US vs International)
| Procedure | US Cost | Mexico Cost | Freeport Cost |
|-----------|---------|-------------|---------------|
| TPLO (Orthopedic) | $4,000–$6,000 | $1,200 | $1,500–$2,500 |
| Dental Extractions | $1,000–$2,000 | $150–$250 | $200–$350 |
| Spay/Neuter (Large Dog) | $300–$800 | $90–$120 | $200–$350 |
| Consultation | $100–$250 | $15–$40 | $40–$60 |

---

## 3. Critical Operational Lessons

### 3.1 Verification-First Methodology
- **Never assume cost savings % without verified market data** (Georgia example: assumed 30–50% savings, actual was ~10% statewide per MarketWatch 2026)
- Always show work: formulas, sources, dates
- Published clinic prices are not real until verified via direct contact
- Clinics often don't answer phones, change prices post-consultation

### 3.2 Regulatory Pitfalls
- **Bahamas:** No USDA endorsement required, no screwworm certificate, same-day import permits via Click2Clear ($11.20)
- **Mexico:** Screwworm certificate required within 5 days of return, CDC rabies high-risk status = false
- **Florida CPOM:** Vet practices must be owned by licensed vets → use MSO-PC model (Management Services Organization + Professional Corporation)

### 3.3 Technical Learnings
- **DarkAges Project:** C++20/CMake/Godot 4.2.2, migrated from WSL2→native Windows, 127 server files + 151 tests
- **Hugo Website:** Stack theme, content-site-builder skill created for Hugo site generation from planning docs
- **Skills Created:** content-site-builder, project-task-triage, systematic-debugging (patched with Python dict pitfall fix)

---

## 4. Competitor Analysis

| Competitor | Model | Geography | Limitation |
|-----------|-------|-----------|------------|
| MexiVet Express | Land-border shuttle | San Diego-Tijuana (West Coast) | No East Coast presence, no integrated financing |
| FareVet | AI price comparison | Nationwide (digital) | No coordination, no all-in guarantee |
| Operation SNIP (Largo) | Direct low-cost clinic | Pinellas County | Local only, no referral network |

**MedPup Gap:** No East Coast competitor combines active price comparison, all-in cost guarantee, and flat-fee coordination.

---

## 5. Next Steps (From QuickStartExecutionGuide)

1. **Deploy Website:** `cd website && hugo --minify` → push to GitHub Pages/Netlify
2. **Set Up Email/Phone:** hello@medpup.com + (727) Google Voice number
3. **Send Clinic Outreach:** ASPCA CVC, Good Care, HSTB scripts in `02_PHASES/`
4. **Validate Demand:** Facebook post tests (price frame vs guarantee frame)
5. **First Client Intake:** auto_quote.py → route card → book within 7 days

---

## 6. Memory-Persisted Facts
- User (Cameron, Largo FL) prefers autonomous execution, no menu of options — pick best path
- No domain purchases, email signups, or vet outreach without explicit approval
- .venv/ must NOT be tracked in repos
- All builds/tests local-only, no CI/GitHub Actions
- Git flow: commit to main directly, push to origin