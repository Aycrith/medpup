# MedPup Quick Start: From Zero to First Booking in 7 Days

**Goal:** Get the first paying client booked within 7 days, using only the assets already created. No waiting for perfection.

**Business model:** Pinellas County / Largo-based. Phase 1 routes clients to ASPCA CVC Liberty City and Good Care Animal Clinic (Hialeah). MedPup charges a $25–$100 flat coordination fee per client. All-in cost is confirmed before booking — if the final bill exceeds the confirmed range, MedPup covers the excess or provides a backup clinic at no cost.

---

## The 5-Step Sprint

```
STEP 1: DEPLOY THE WEBSITE (Day 1)
   │    → hugo server at localhost:1313 or push to GitHub Pages
   ▼
STEP 2: SET UP EMAIL & PHONE (Day 1)
   │    → hello@medpup.com + (727) area code via setup guide
   ▼
STEP 3: SEND CLINIC OUTREACH EMAILS (Day 2)
   │    → ASPCA CVC + Good Care scripts from 02_PHASES/
   ▼
STEP 4: VALIDATE DEMAND (Day 3)
   │    → run the Test A / Test B Facebook post drafts
   ▼
STEP 5: FIRST CLIENT INTAKE (Days 4–7)
   │    → auto_quote.py → route card → book
```

---

## STEP 1: Deploy the Website (Day 1 – 60 minutes)

The Hugo site is already built. From the `website/` directory:

    cd website && hugo server   # preview at localhost:1313
    cd website && hugo --minify # production build → website/public/

**Option A — Local preview (fastest):** Run `hugo server` and share the localhost URL with test users.

**Option B — GitHub Pages:** Push `website/public/` to a `gh-pages` branch. The repo already has a complete Stack-theme build with 10+ content pages.

**Option C — Netlify:** Drag the `website/` folder onto Netlify Drop. Hugo is auto-detected.

The homepage (`website/content/_index.md`) now leads with the all-in cost guarantee — not marketing prices. The messaging is already correct.

---

## STEP 2: Set Up Email & Phone (Day 1 – 30 minutes)

Follow the step-by-step walkthrough in `02_PHASES/Phase1_GoogleVoiceAndEmailSetup.md`.

| Tool | Action |
|------|--------|
| Google Workspace or Zoho Mail | Create `hello@medpup.com` |
| Google Voice | Claim a (727) number; forward to cell |
| Email signature | Your name · Founder & Concierge, MedPup · hello@medpup.com |

---

## STEP 3: Send Clinic Outreach Emails (Day 2 – 30 minutes)

Four outreach scripts are in `02_PHASES/`:

| Clinic | Script | Status |
|--------|--------|--------|
| ASPCA CVC Liberty City | `Phase1_ASPCA_CVC_OutreachScript.md` | ✓ Updated — surprise-bill framing + hidden add-ons |
| Good Care Animal Clinic | `Phase1_GoodCare_OutreachScript.md` | ✓ Updated — surprise-bill framing + hidden add-ons |
| Humane Society of Tampa Bay | `Phase1_HSTB_OutreachScript.md` | ✓ Updated — Pinellas eligibility check frame |
| Operation SNIP (Largo) | `Phase1_OperationSNIP_OutreachScript.md` | Fill-in — competitor vs. partner unclear (phone call required, deferred) |
|----------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| 4 clinic outreach emails sent | [ ] | Skip Operation SNIP email until partnership decision is made |

**N.B.** Do not send the Operation SNIP email until you decide whether they are a competitor or a referral partner.

---

## STEP 4: Validate Demand (Day 3 – 1 hour)

Two Facebook post drafts are ready at `02_PHASES/Phase1_FacebookTestPost.md`:

- **Test A (price frame):** "Dental cleaning $285 — save $1,200 vs. US average"
- **Test B (guarantee frame):** "Final bill $895–$3,710 confirmed before you book — if it exceeds that we cover the excess"

Post to Largo / Pinellas pet owner Facebook groups. Track comments and reactions. The goal is not virality — it is whether people who actually need dental/spay/neuter care respond.

None of this spills into paid spend or requires your approval. Review the posts, hit post, check Reactions within 24 hours.

---

## STEP 5: First Client Intake (Days 4–7 – Ongoing)

When inquiries arrive:

1. **Reply within 2 hours.**
2. **Run auto_quote.py** with the client's procedure and location. This returns a ranked route card showing the published marketing price, the estimated all-in range (adds hidden add-ons: blood work, pain meds, X-rays, e-collar, post-op), and the guarantee statement.
3. **Send the route card** to the client. The guarantee language ("MedPup guarantees all-in cost is between $X–$Y before you book") is now embedded in every output automatically.
4. **If they reply 'BOOK IT':** use `price_guarantee.py` to lock the all-in range before confirming the appointment.
5. **Save the intake** to `02_PHASES/voc/` via `intake_schema.py` for VOC tracking.

---

## What You Need by the End of Week 1

| Deliverable | Status |
|-------------|--------|
| Live website (preview or deployed) | [ ] |
| hello@medpup.com | [ ] |
| Business phone (727) | [ ] |
| 4 clinic outreach emails sent | [ ] |
| Test A + Test B Facebook posts live | [ ] |
| First client inquiry received | [ ] |
| First auto_quote.py route card sent | [ ] |

---

## Phase 1 Economic Model (the bottom line)

| Item | Amount |
|------|--------|
| MedPup coordination fee | $25–$100 flat per client |
| ASPCA CVC dog spay marketing price | $40–$80 (all-in: $100–$240 with add-ons) |
| Good Care dental marketing price | $285–$595 (all-in: $895–$3,710 with add-ons) |
| Surprise bill guarantee | MedPup covers excess or routes client to backup clinic |

The pricing database (`pricing_intel_v3.db`) already contains verified pricing from all four Phase 1 clinics. The `route_engine.py` and `auto_quote.py` tools are fully operational — running `python auto_quote.py` returns a complete ranked route card in under one second.

---

## What Is NOT Required

- ❌ Upfront clinic investment — $0 capital model
- ❌ Ferry logistics — Pinellas is a drive, not a boat trip
- ❌ International permits — US-only in Phase 1
- ❌ CareCredit negotiation — Flat coordination fee only
- ❌ Full website — Hugo build ships with a complete 10-page site ready to deploy

---

## Next Steps After Week 1

1. ~Rewrite `BusinessPlanStrategy.md` and `one-source-of-truth.md` to reflect the Pinellas Phase 1 pivot~ ✅ **DONE** — BusinessPlanStrategy.md rewritten for Phase 1. OST G7 updated.
2. Call Operation SNIP (727) 327-7647 — decide competitor vs. partner (user approval required; not executable by agent).
3. Deploy the live Hugo site (push to GitHub Pages or Netlify).
4. Run the first client intake end-to-end through `auto_quote.py` and save to `02_PHASES/voc/`.

---

*This document is updated as of commit 700f1b5 (May 20 2026). All tooling references are current.*
