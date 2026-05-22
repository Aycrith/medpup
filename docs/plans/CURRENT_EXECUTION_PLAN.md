# MedPup Current Execution Plan

**Source:** QuickStartExecutionGuide.md  
**Goal:** First paying client booked within 7 days  
**Last updated:** May 22, 2026

---

## 5-Step Sprint

```
STEP 1: DEPLOY WEBSITE (Day 1)
   │    → cd website && hugo --minify → push to GitHub Pages/Netlify
   ▼
STEP 2: SET UP EMAIL & PHONE (Day 1)
   │    → hello@medpup.com + (727) Google Voice number
   ▼
STEP 3: SEND CLINIC OUTREACH (Day 2)
   │    → ASPCA CVC, Good Care, HSTB scripts in 02_PHASES/
   ▼
STEP 4: VALIDATE DEMAND (Day 3)
   │    → Facebook post tests (price frame vs guarantee frame)
   ▼
STEP 5: FIRST CLIENT INTAKE (Days 4-7)
   │    → auto_quote.py → route card → book
```

---

## Step Details

### Step 1: Deploy Website (60 mins)
- Preview: `cd website && hugo server` (localhost:1313)
- Production build: `cd website && hugo --minify` → outputs to `website/public/`
- Deploy options:
  - **GitHub Pages:** Push `website/public/` to `gh-pages` branch
  - **Netlify:** Drag `website/` folder to Netlify Drop
- Homepage already leads with all-in cost guarantee

### Step 2: Email & Phone (30 mins)
- Create `hello@medpup.com` via Google Workspace/Zoho Mail
- Claim (727) number via Google Voice, forward to cell
- Email signature: *Your name · Founder & Concierge, MedPup · hello@medpup.com*

### Step 3: Clinic Outreach (30 mins)
| Clinic | Script | Status |
|--------|--------|--------|
| ASPCA CVC Liberty City | `Phase1_ASPCA_CVC_OutreachScript.md` | ✓ Updated |
| Good Care Animal Clinic | `Phase1_GoodCare_OutreachScript.md` | ✓ Updated |
| Humane Society of Tampa Bay | `Phase1_HSTB_OutreachScript.md` | ✓ Updated |
| Operation SNIP (Largo) | `Phase1_OperationSNIP_OutreachScript.md` | ⏳ Deferred (phone call required) |

### Step 4: Validate Demand (1 hour)
- Test A (price frame): *"Dental cleaning $285 — save $1,200 vs US average"*
- Test B (guarantee frame): *"Final bill $895–$3,710 confirmed before you book — if it exceeds that we cover the excess"*
- Post to Largo/Pinellas pet owner Facebook groups
- Track comments/reactions (not virality — actual need)

### Step 5: First Client Intake (Days 4-7)
1. Reply to inquiries within 2 hours
2. Run `auto_quote.py` for procedure/location → ranked route card with all-in range
3. Send route card with guarantee language
4. On "BOOK IT": run `price_guarantee.py` to lock all-in range
5. Save intake to `02_PHASES/voc/` via `intake_schema.py`

---

## Dependencies
- No capital required
- No international logistics
- No government filings for Phase 1
- All scripts/tools already created in repo