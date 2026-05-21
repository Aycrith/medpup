---
name: pre-launch-audit
description: >-
  Full pre-launch checklist for MedPup Phase 1 - verifies site build, pipeline integrity,
  schema markup, sitemap coverage, contact form, and pricing completeness before anything
  goes live. Catches 4 bug patterns: KeyError in real_cost_calculator,
  missing zip_code in format_human, no-results dict gaps, and tplo/ivdd scenario mapping.
---

# Pre-Launch Audit - MedPup Phase 1

## When to use

Before deploying the Hugo site or starting any outbound outreach. Run this checklist
whenever `website/public/` changes or a core pipeline file (auto_quote.py,
route_engine.py, real_cost_calculator.py) is modified.

## Checklist (ordered by severity)

### 1. Site build integrity (zero tolerance)

```bash
cd website && hugo --minify 2>&1 | grep "Total in"
# Must show: Total in ... ms  and  Errors: 0
```

- [ ] Hugo exits 0
- [ ] >= 100 HTML pages in website/public/
- [ ] No error in build output

### 2. Core pipeline smoke test

```bash
python auto_quote.py --scenario "large dog spay" --zip "33770" --json | python -c "import json,sys; c=json.load(sys.stdin); assert len(c['route_card'])>0"
python auto_quote.py --scenario "dental"           --zip "33770" --json | python -c "import json,sys; c=json.load(sys.stdin); assert len(c['route_card'])>0"
python auto_quote.py --scenario "tplo"              --zip "33770" --json | python -c "import json,sys; c=json.load(sys.stdin); assert c['status'] in ('success','no_results')"
python auto_quote.py --scenario "made_up_procedure" --zip "33770"     # must not crash
```

- [ ] All scenarios enter JSON output without Exception
- [ ] No-results path produces friendly text (not a traceback)
- [ ] all_in_guarantee appears in every route card option

**4 crash bugs to watch for:**

| Bug | Location | Fix |
|-----|----------|-----|
| KeyError: typical_markup_src | real_cost_calculator.py:88 | Add typical_markup_src to default fallback dict |
| KeyError: zip | auto_quote.py:137 | Use card['intake'].get('zip_code', ...) |
| KeyError: us_reference in no-results | auto_quote.py:70+ | Add us_reference: 0 to no-results dict |
| KeyError: call_to_action in no-results | same | Add call_to_action to no-results dict |
| tplo/ivdd crashes DB lookup | auto_quote.py:46-54 | Add tplo->surgery, ivdd->surgery to scenario_from_procedure |

### 3. Price guarantee edge cases

```bash
# Within range - OK
python price_guarantee.py --procedure Spay --confirmed-low 100 --confirmed-high 240 --final-bill 180 --check
# Exceeds range - BACKUP CLINIC
python price_guarantee.py --procedure Spay --confirmed-low 100 --confirmed-high 240 --final-bill 600 --check
```

- [ ] Within range case returns 0 / green
- [ ] Exceeds range case returns non-zero / BACKUP

### 4. VOC pipeline round-trip

```bash
python intake_schema.py   # shows schema
python intake_schema.py --list        # shows VOC record table
python intake_schema.py --show <id>   # shows full JSON for one intake
```

- [ ] --schema works
- [ ] --list shows any saved intake (>= 1)
- [ ] --show <id> returns the full JSON for that intake

### 5. JSON-LD structured data

```bash
grep -c "LocalBusiness" website/public/index.html
grep -c "FAQPage"      website/public/index.html
grep -c "Question"     website/public/index.html
```

- [ ] @type: LocalBusiness present
- [ ] @type: FAQPage present
- [ ] @type: Question present (one or more)

### 6. Sitemap coverage

Use the script in the article above.

### 7. Contact form

Open website/public/contact/index.html:

- [ ] <form tag present with netlify attrs
- [ ] method=POST (case-insensitive)
- [ ] Required fields: name, email, phone, pet name, procedure, location
- [ ] Honeypot field (bot-field) present

### 8. Pricing freshness

```bash
python scripts/pricing_freshness_alert.py --quiet; echo "exit \$?"
```

- [ ] Exits 0 (no stale records) on first run after data collection
- [ ] pricing_alerts.json is written

### 9. Privacy / legal files

- [ ] templates/privacy-policy.md exists
- [ ] templates/terms-of-service.md exists
- [ ] templates/client-service-agreement.md exists
- [ ] CCPA/FIPA/GDPR language in privacy.md

### 10. Footer guarantee badge

```bash
grep -c "All-In Cost Guarantee" website/public/index.html
```

- [ ] Green guarantee badge visible in footer on every page
- [ ] Privacy Policy | Terms of Service links present

## Post-audit action map

| Issue | Fix |
|---|---|
| P0: crash in auto_quote | Patch scenario_from_procedure + no-results dict |
| P1: stale pricing | Contact clinic by phone, update pricing_intel_v3.db |
| P2: missing schema | Add JSON-LD to website/layouts/partials/head/custom.html |
| P3: form fields mismatch | Align contact.md form to intake_schema.py required fields |
| P4: sitemap gap | Write sitemap config, verify writeStats: true |
| P5: no robots.txt | Add website/static/robots.txt after first deploy |
