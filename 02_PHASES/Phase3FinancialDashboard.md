Create a new file: **`Phase3FinancialDashboard.md`** and paste the content below.

---

```markdown
# Phase 3: Financial Tracking & Profitability Dashboard

## Overview

This is a Google Sheets template that tracks every trip's financial performance in real time. It calculates trip-level profit, aggregates monthly, and compares actuals to the projections from Phase 1. The concierge or business manager updates it after each trip in under 2 minutes.

## 1. Dashboard Structure (Tabs)

| Tab Name | Purpose |
|----------|---------|
| Trip Ledger | One row per trip; all revenue & direct costs |
| Monthly Summary | Auto-aggregated P&L by month |
| Concierge Fee Tracker | Concierge fees collected per client |
| Marketing Spend | Ad costs, lead sources, CAC |
| Projection vs Actual | Side-by-side with Phase1 CSV projections |

## 2. Trip Ledger (Main Tab)

**Import the following CSV into Google Sheets:**

```csv
Trip Date,Trip ID,Destination,Pets,Concierge Fee Revenue ($),Surgery Revenue to Clinic ($) - Not MedPup,Ferry Cost ($),Permit Cost ($),Concierge Pay ($),Misc Cost ($),Total Direct Cost ($),Trip Gross Profit ($),Trip Margin (%),Notes
2026-06-14,FP-001,Freeport,4,1140,0,0,44.80,200,50,294.80,845.20,74.1%,"Pilot trip"
```

**Column Formulas (set for row 2, copy down):**

| Column | Formula |
|--------|---------|
| `Concierge Fee Revenue ($)` | `=D2*285` (assuming $285 per pet; adjust as pricing changes) |
| `Surgery Revenue to Clinic` | Manual entry (informational only, not MedPup revenue) |
| `Ferry Cost ($)` | Manually enter group ferry fare |
| `Permit Cost ($)` | `=D2*11.20` |
| `Concierge Pay ($)` | Flat $200 per day-trip (adjust as needed) |
| `Misc Cost ($)` | Manual (parking, snacks, emergency supplies) |
| `Total Direct Cost ($)` | `=SUM(F2:I2)` |
| `Trip Gross Profit ($)` | `=E2-J2` |
| `Trip Margin (%)` | `=K2/E2*100` |

## 3. Monthly Summary Tab

**Use Google Sheets QUERY formula to auto-populate:**

```sql
=QUERY('Trip Ledger'!A:M, "SELECT month(A)+1, sum(E), sum(J), sum(K), avg(L) WHERE A IS NOT NULL GROUP BY month(A)+1 LABEL month(A)+1 'Month', sum(E) 'Total Concierge Revenue', sum(J) 'Total Direct Costs', sum(K) 'Gross Profit', avg(L) 'Avg Margin'")
```

Then manually add a Fixed Overhead row (from Phase1: $1,417/month) and calculate Net Profit = Gross Profit - Fixed Overhead.

**Example Output:**

| Month | Concierge Revenue | Direct Costs | Gross Profit | Fixed Overhead | Net Profit |
|-------|-------------------|--------------|--------------|----------------|------------|
| June  | $1,140            | $294.80      | $845.20      | $1,417         | -$571.80   |
| July  | $2,850            | $737.00      | $2,113.00    | $1,417         | $696.00    |
| Aug   | $4,275            | $1,105.50    | $3,169.50    | $1,417         | $1,752.50  |

**Conditional Formatting:** Net Profit cells green if >0, red if <0.

## 4. Concierge Fee Tracker

```csv
Client Name,Pet Name,Trip ID,Concierge Fee Charged ($),Paid? (Y/N),Payment Date,Payment Method,Notes
Jane Doe,Bella,FP-001,285,Y,2026-06-01,Invoice Ninja (card),
John Smith,Max,FP-001,285,Y,2026-06-02,Invoice Ninja (ACH),
```

**Summary row:** `=SUMIF(E:E,"Y",D:D)` to show total collected.

## 5. Marketing Spend & CAC Tab

```csv
Date,Channel,Spend ($),Impressions,Clicks,Leads,Bookings,CAC ($),Notes
2026-06-01,Google Ads,100,2000,80,5,1,100,
2026-06-05,Facebook Boost,50,1500,60,3,1,50,
2026-06-10,Vet Referral,0,0,0,2,0,0,Organic
```

**CAC Formula:** `=IF(H2>0, F2/H2, 0)` (Spend / Bookings)

**Blended CAC row:** `=SUM(F:F)/SUM(H:H)` at bottom.

## 6. Projection vs Actual Tab

Copy the Phase 1 financial projection CSV, then add Actual columns next to each month and a Variance column.

**Structure:**

| Month | Proj. Revenue | Actual Revenue | Variance $ | Variance % |
|-------|---------------|----------------|------------|------------|
| June  | $3,600        | ='Monthly Summary'!B2 | =C2-B2 | =D2/B2*100 |
| July  | $4,500        | ...            | ...        | ...        |

**Chart:** Create a line chart with two series (Projected vs Actual Revenue) to visualize growth.

## 7. Dashboard Quick-View (First Tab)

Add a "Dashboard" tab as the landing sheet with these cells:

| Metric | Formula |
|--------|---------|
| Total Revenue (All Trips) | `=SUM('Trip Ledger'!E:E)` |
| Total Gross Profit | `=SUM('Trip Ledger'!K:K)` |
| Average Trip Margin | `=AVERAGE('Trip Ledger'!L:L)` |
| Total Pets Served | `=SUM('Trip Ledger'!D:D)` |
| Total Trips Completed | `=COUNTA('Trip Ledger'!A:A)-1` |
| Blended CAC | `=Marketing Spend'!F_total/'Marketing Spend'!H_total` |
| Net Profit (YTD) | `=SUM('Monthly Summary'!G:G)` |

Add a sparkline for monthly net profit trend.

## 8. Setup Instructions

1. Create a new Google Sheet: **MedPup Financial Dashboard**.
2. Rename tabs as listed above.
3. Import each CSV into its tab (File > Import).
4. Add formulas as specified.
5. Share with view/edit permissions: concierge (edit), accountant (edit), partners (view).
6. After each trip, add one row to Trip Ledger. Everything else updates automatically.
7. Review monthly: compare Projection vs Actual, adjust pricing or marketing spend if CAC rises or margins slip.
```

---

This is the final piece of the Phase 3 execution toolkit. With this dashboard, you can track every dollar from Day 1 and make data-driven decisions.

**What remains to go live:**

- Deploy website and CRM (Phase 2 instructions exist).
- Sign Freeport clinic (outreach email is drafted).
- Run the Google Ads geo-fencing campaign (ad copy done, just needs setup in Google Ads).
- Book the pilot trip clients (social media and vet referral engines are built).

The assets are now sufficient to move to **Phase 4: Launch & First Trip Execution**. I recommend I produce the **Launch Week Action Plan** — a day-by-day checklist covering the 7 days leading up to the first pilot trip, including final website go-live, ad launch, client confirmations, and a dress rehearsal. Shall I proceed?