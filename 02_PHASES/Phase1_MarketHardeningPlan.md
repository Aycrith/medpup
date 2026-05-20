# MedPup Market Hardening Plan
## Build a routable market map — not just a pricing DB

---

## The Problem

Right now MedPup has 2 verified partners and 10 "call required" clinics.
If either verified partner pulls out, routing is dead.
If a new clinic publishes pricing tomorrow, MedPup never sees it without a manual re-scan.

**The current model:** a static price list for 2 clinics.
**The hardened model:** a live, ranked market of every available clinic option for any client in any Pinellas zip code.

---

## Hardening Strategy — 5 Pillars

### Pillar 1 — Market Expander (auto-discovery pipeline)

**Goal:** Continuously find new clinics in the routing radius without manual research.

**How:**

Run a multi-source discovery script weekly against:
- Google Maps API (free tier): `veterinary + [city/town]` within 60 miles of Largo
- Pet owner forums + FB groups extracted via web search
- Yelp/Google Places free tier: search `low cost vet pinellas`, `spay neuter tampa`
- State license board lookups: Florida Board of Veterinary Medicine clinic roster

Each discovered clinic → checked for URL → scored immediately
Scores: price availability → extractable (4/4 methods succeeded) or black box (needs call)

**Output:** New clinic candidate list → feed into Pillar 2.

### Pillar 2 — Route Scoring Engine (price × travel time)

**Goal:** Rank every clinic by a composite score, not a flat fee table.

**Scoring formula:**

```
Route Score = (0.60 × price_score) + (0.40 × travel_score)

where:
  price_score = 1 - (clinic_price / us_avg_price)
                → 0 = same price as U.S., 1 = free

  travel_score = 1 - (drive_minutes / 120)
                 → 0 = 2hr drive, 1 = clinic at home
```

**Composite procedure score:**
For multi-procedure cases (dental + extractions, spay + microchip), compute a blended price across the clinic's published range and route to the clinic that minimizes the combined score.

**Admin cost:** Clinic charges directly, MedPup fee fixed. Route to highest total-score clinic.
Route card: top 3 options shown to client with exact savings breakdown for each.

### Pillar 3 — Verified Options Cache (VOC)

**Goal:** Use every past routed client to strengthen the market map.

**How:**
An intake data schema captures:
- Client zip code (travel origin)
- Procedure needed
- Their U.S. quote
- Which clinic they selected
- Outcome: completed / canceled / no-show

This feeds back to:
- Update travel time accuracy per zip code
- Adjust booking lead-time estimates per clinic
- Identify patterns: "clients from St. Pete choose X clinic 70% of the time"

The V cache turns the coordination data into a continuously improving routing table.

### Pillar 4 — Freshness Monitor (time-decay confidence)

**Goal:** Clinic pricing changes. MedPup must not serve stale data.

**How:**
Every pricing entry gets a `freshness_ttl`:
- ASPCA CVC spay $40-80: TTL = 90 days (published, low change frequency)
- Good Care dental $285-595: TTL = 60 days
- Any clinic needing a call: TTL = 7 days (call again next week)

Monitored daily by honeypot_run.py:
- Re-run last 4 extraction methods for aging entries
- Any price delta >20% → flag as "needs verification"
- Venue: writes to `pricing_alerts.json` with `{clinic_id, procedure, old_price, new_price, detected_at}`

### Pillar 5 — Demand-Capture Funnel (inbound routing feed)

**Goal:** More organic requests → more route decisions → more VOC data.

**How:**
The contact form on the site is the demand capture tool. Every intake:
1. Auto-quotes using cached pricing
2. Generates a route card immediately (no human in the loop)
3. Only flags an exception if pricing is stale or missing

The funnel is: organic search → intake form → auto-quote → route card → human confirms → appointment booked → VOC update.

The auto-quote engine (Pillar 5!) is the final hardening layer — it removes the single human as the rate limiter.

---

## Implementation Order

| Pillar | Dependencies | Effort | Revenue Impact |
|--------|-------------|--------|----------------|
| Pillar 1 — Market Expander | price_intel_v3.py | Low (extend existing script) | Immediately more options |
| Pillar 2 — Route Scoring Engine | Pillar 1 output | Medium (new Python module) | Better conversion, client trust |
| Pillar 3 — V Cache | Contact form captures data | Low | Learning loop, accuracy |
| Pillar 4 — Freshness Monitor | honeypot_run.py exists | Low (patch existing) | Trust, no stale quotes |
| Pillar 5 — Auto-quote Engine | Pillar 1 + 2 + 4 | Medium (webhook or form handler) | Scales throughput 5-10x |

**Target hardening window:** 2–3 sessions total if executed in order.

---

## Success Criteria

- [ ] `market_expander.py` produces a candidate clinic list ≥ 20 locations
- [ ] `route_engine.py` outputs a ranked route card per intake scenario
- [ ] All Phase 1 partner pricing TTL > 60 days with no stale alerts
- [ ] 3+ new clinics move from "call required" to "verified pricing" via auto-quote
- [ ] Intake form auto-generates route cards (no human responding per lead)
