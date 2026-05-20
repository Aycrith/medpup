# Pricing Intelligence Engine v3

## What It Does

Extracts real veterinary pricing data from clinic websites using three strategies:

1. **JS Bundle Analysis** — Scrapes React/Vue SPA bundles for embedded pricing data (works on modern sites like VetCancun, Dutch.com)
2. **HTML Content Scan** — Parses rendered HTML for pricing on WordPress/jQuery sites (Good Care Animal Clinic, etc.)
3. **Wayback Machine Fallback** — Archived snapshots for Cloudflare-blocked sites (Dr. Kelly's, etc.)

## Results (May 20, 2026 Scan)

| Clinics Scanned | 18 |
| Pricing Points | 107 (1 high, 99 medium, 7 low confidence) |

### Best Data Sources

| Clinic | Prices | Best Deals Found |
|--------|--------|-----------------|
| **VetCancun** 🇲🇽 | 31 | Spay $75-150, Dental $50-125 USD |
| **Good Care Animal Clinic** (Hialeah FL) | 47 | Spay $450-1600, Neuter $350-780, Dental $285-595 |
| **ASPCA CVC Miami** | 5 | Spay/Neuter $40-80 |
| **Dr Kelly's Phoenix** ℹ️ | 4 | Spay/Neuter $390-600 (Wayback) |
| **Dutch Telehealth** | 7 | Subscription $33-100/mo |

### Key Insight: The Data Gap

Of 28 attempted clinic scans:
- **4 sites** had extractable pricing (VetCancun, Good Care, ASPCA CVC, Dr Kelly's Wayback)
- **14 sites** had no pricing data at all
- **4 URLs** didn't exist (dead domains)
- Most local clinics (Operation SNIP, Humane Society) don't publish prices online

This confirms the fundamental problem: **you can't autonomously extract what clinics don't publish.**

## Usage

```bash
# Scan a single clinic
python price_intel_v3.py scan https://vetcancun.com

# Scan all known clinics
python price_intel_v3.py scan --all

# Generate report
python price_intel_v3.py database --report

# Export to JSON
python price_intel_v3.py database --export-json

# Clear database
python price_intel_v3.py database --clear
```

## Database

Stored in `pricing_intel_v3.db` (SQLite) with tables:
- `clinics` — Each clinic's contact info and scan status
- `pricing` — All extracted prices with confidence scores
- `js_bundles` — Bundle metadata per scan
- `form_submissions` — Form endpoint tracking
