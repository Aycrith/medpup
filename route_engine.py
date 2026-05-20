"""
route_engine.py — MedPup routing score calculator
Reads pricing_intel_v3.db, scores every clinic × procedure combo,
and returns a ranked route card for any client scenario.

Usage:
  python route_engine.py                    # full market board
  python route_engine.py --scenario dental  # score dental only
  python route_engine.py --zip 33701        # score from Largo 33701
  python route_engine.py --json             # machine-readable output
"""
import sqlite3, json, sys, argparse
from pathlib import Path

DB = Path(r"C:\Users\camer\DEVNEW\animalaid\pricing_intel_v3.db")

# ── Reference U.S. average prices ─────────────────────────────────────────
US_AVG = {
    "Spay/Neuter":           600.0,   # large dog qty
    "Dental Cleaning":       1500.0,
    "Surgery":               1500.0,
    "Mass Removal":          1500.0,
    "Pyometra Surgery":      2800.0,
    "Entropion Repair":      3000.0,
    "Cherry Eye Repair":     3000.0,
    "Vaccination":           100.0,
    "Microchip":             100.0,
    "Consultation":          100.0,
    "Exam":                  100.0,
    "Health Certificate":    300.0,
    "Deworming":             200.0,
}

# ── Travel-time lookup (minutes from Largo zip centroids) ──────────────────
# Will be auto-enriched by Pillar 3 (VOC) — for now: hard-coded pilot
DRIVE_MINUTES = {
    "33701": {   # Largo
        21: 55,   # ASPCA CVC Liberty City
        7:  55,   # Good Care Hialeah
        4:  28,   # HSTB Tampa
        2:  12,   # Operation SNIP (Pinellas)
        14: 35,   # Paws 2 Help WPB
        13: 45,   # Justin Bartlett Royal Palm
        23: 270,  # Thomasville GA
    },
    "default": { # fallback for all unknown zips — use city-level
        21: 55,
        7:  55,
        4:  28,
        2:  12,
        14: 35,
        13: 45,
    }
}

def drive_time(clinic_id, zip_code="33701"):
    return DRIVE_MINUTES.get(zip_code, DRIVE_MINUTES["default"]).get(
        clinic_id, 60  # unknown = 60 min default
    )

# ── Scoring functions ──────────────────────────────────────────────────────
def price_score(price_low, proc_key):
    us = US_AVG.get(proc_key, price_low * 2)
    if price_low is None or price_low <= 0:
        return 0.0
    return max(0.0, min(1.0, 1.0 - (price_low / us)))

def travel_score(minutes):
    max_min = 120.0
    return max(0.0, min(1.0, 1.0 - (minutes / max_min)))

def composite(price_s, travel_s, price_w=0.60, travel_w=0.40):
    return round(price_w * price_s + travel_w * travel_s, 4)

def freshness_score(clinic_id, procedure):
    """TTL-based confidence decay."""
    import datetime
    conn = sqlite3.connect(str(DB))
    cur = conn.cursor()
    cur.execute("""
        SELECT discovered_at, confidence
        FROM pricing
        WHERE clinic_id=? AND procedure_name LIKE ?
        ORDER BY discovered_at DESC LIMIT 1
    """, (clinic_id, f"%{procedure}%"))
    row = cur.fetchone()
    conn.close()
    if not row:
        return 0.0, "missing", 999
    discovered, conf = row
    if discovered is None:
        return 0.5, "unknown", 30
    age_days = (datetime.datetime.now() - datetime.datetime.fromisoformat(discovered)).days
    ttl = {"high": 90, "medium": 60, "low": 30}
    ttl_days = ttl.get(conf, 14)
    frac = max(0.0, 1.0 - (age_days / ttl_days))
    if age_days > ttl_days:
        status = "stale"
    elif age_days > ttl_days * 0.7:
        status = "aging"
    else:
        status = "fresh"
    return round(frac, 3), status, age_days

def load_pricing():
    conn = sqlite3.connect(str(DB))
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, c.id, c.name, c.url, c.address,
               p.procedure_name, p.category,
               p.price_low, p.price_high, p.currency,
               p.confidence, p.confidence_score
        FROM pricing p
        JOIN clinics c ON c.id = p.clinic_id
        WHERE p.procedure_name NOT LIKE 'extracted_from_%'
        ORDER BY p.price_low ASC
    """)
    cols = ['pid','cid','name','url','address','proc','cat','low','high','cur','conf','cscore']
    rows = [dict(zip(cols, r)) for r in cur.fetchall()]
    conn.close()
    return rows

def build_route_cards(scenario=None, zip_code="33701", as_json=False):
    prices = load_pricing()
    if scenario:
        prices = [p for p in prices if scenario.lower() in p['proc'].lower()
                  or scenario.lower() in p.get('cat','').lower()]

    # Collapse to best price per clinic × procedure
    best_per_clinic = {}
    for p in prices:
        key = (p['cid'], p['proc'])
        if key not in best_per_clinic or (p['low'] or 0) < (best_per_clinic[key]['low'] or 999999):
            best_per_clinic[key] = p

    cards = []
    for (cid, proc), p in best_per_clinic.items():
        low = p['low'] or 0
        proc_key = proc
        p_score = price_score(low, proc_key)
        dt = drive_time(cid, zip_code)
        t_score = travel_score(dt)
        comp = composite(p_score, t_score)
        f_score, f_status, f_age = freshness_score(cid, proc)
        cards.append({
            "clinic_id":         cid,
            "clinic_name":       p['name'],
            "clinic_url":        p['url'],
            "address":           p['address'] or "",
            "procedure":         proc,
            "category":          p.get('cat',''),
            "price_low":         low,
            "price_high":        p['high'],
            "currency":          p['cur'],
            "confidence":        p['conf'],
            "confidence_score":  p['cscore'],
            "us_avg":            US_AVG.get(proc_key, 0),
            "price_score":       round(p_score, 4),
            "drive_minutes":     dt,
            "travel_score":      round(t_score, 4),
            "composite_score":   comp,
            "freshness_score":   f_score,
            "freshness_status":  f_status,
            "freshness_age_days":f_age,
        })

    cards.sort(key=lambda x: -x['composite_score'])

    if as_json:
        return json.dumps({"zip": zip_code, "scenario": scenario, "generated_at": "now",
                           "clinics_evaluated": len(cards), "route_card": cards}, indent=2)

    return cards

def print_route_board(cards, scenario=None):
    if scenario:
        print(f"\n═══ ROUTE CARD — {scenario.upper()} from zip {cards[0]['address'][-5:] if cards else '33701'} ═══\n" if cards else "")
    else:
        print("\n═══ FULL MARKET ROUTE CARD (all procedures) ═══\n")

    if not cards:
        print("  No pricing data available.")
        return

    print(f"  {'RANK':<5} {'CLINIC':<42} {'PROC':<22} {'PRICE':<14} {'DRIVE':<7} {'COMP':<6} {'FRESH'}")
    print(f"  {'─'*110}")
    for i, c in enumerate(cards[:20], 1):
        hi = f"${c['price_high']:.0f}" if c['price_high'] else "—"
        fresh_marker = {"fresh":"🟢","aging":"🟡","stale":"🔴","missing":"⬛"}.get(c['freshness_status'],"?")
        print(f"  {i:<5} {c['clinic_name'][:40]:<42} {c['procedure'][:20]:<22} "
              f"${c['price_low']:.0f}–{hi:<7} {c['drive_minutes']}min {'':<2} "
              f"{c['composite_score']:.3f}  {fresh_marker}{c['freshness_status']}")

    # Show top 3 with savings
    print(f"\n  ── TOP ROUTES ──────────────────────────────────────────────────")
    for i, c in enumerate(cards[:3], 1):
        us = c['us_avg']
        sav = us - c['price_low'] if us > 0 else 0
        print(f"  #{i}  {c['clinic_name']}")
        print(f"      {c['procedure']}: ${c['price_low']:.0f}–{c['price_high'] or '?'} vs. US avg ${us:.0f}  → save ~${sav:.0f}")
        print(f"      Drive: {c['drive_minutes']}min  Score: {c['composite_score']:.3f}  "
              f"Freshness: {c['freshness_status']} ({c['freshness_age_days']}d)")
        print()

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenario", help="Filter by procedure keyword (e.g. dental, spay)")
    ap.add_argument("--zip", default="33701", help="Client zip code for travel scoring")
    ap.add_argument("--json", action="store_true", help="Output as JSON")
    args = ap.parse_args()

    cards = build_route_cards(scenario=args.scenario, zip_code=args.zip, as_json=args.json)
    if args.json:
        print(cards)
    else:
        print_route_board(cards, scenario=args.scenario)
