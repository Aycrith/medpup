"""
auto_quote.py  — MedPup auto-quote engine
Consumes a client intake (JSON stdin or file), runs the route_engine
for matching procedures, and returns a route card the client can
review immediately without waiting for a human.

Usage:
  echo '{...}' | python auto_quote.py
  python auto_quote.py intake_example.json
  python auto_quote.py --scenario dental --zip 33771  --us-quote 1800

Output:
  Route card with ranked clinic options including drive time,
  price comparison, savings vs US avg, and direct-links per clinic.
"""
import sys, json, argparse
from pathlib import Path

# Reuse route engine
sys.path.insert(0, str(Path(r"C:\Users\camer\DEVNEW\animalaid")))
from route_engine import build_route_cards, US_AVG

BASE = Path(r"C:\Users\camer\DEVNEW\animalaid")

INTAKE_SCHEMA = {
    "procedure": "Dental Cleaning",
    "procedure_category": "dental",  # spay, neuter, dental, mass, surgery
    "pet_species": "dog",            # dog / cat
    "zip_code": "33701",             # client location
    "us_quote": None,                # optional: client's existing US quote
    "weight_lbs": 45,                # optional: for surgery pricing variance
    "financing_available": False,    # whether client has carecredit etc.
    "notes": "",
}

def load_intake(path=None):
    if path:
        return json.loads(Path(path).read_text())
    # Read stdin
    data = json.loads(sys.stdin.read())
    return {**INTAKE_SCHEMA, **data}

def scenario_from_procedure(proc):
    """Map procedure to a route_engine scenario filter."""
    p = proc.lower()
    mapping = {
        "dental": "dental",
        "spay": "spay",
        "neuter": "spay",
        "mass": "surgery",
        "tumor": "surgery",
        "surgery": "surgery",
        "pyometra": "surgery",
    }
    for k, v in mapping.items():
        if k in p:
            return v
    return proc.split()[0].lower()

def build_route_card(intake):
    scenario = scenario_from_procedure(intake.get("procedure",""))
    zip_code = intake.get("zip_code", "33701")
    cards = build_route_cards(scenario=scenario, zip_code=zip_code, as_json=False)

    if not cards:
        return {
            "status": "no_results",
            "message": f"No verified pricing found for '{scenario}' in DB. "
                       "This clinic needs a phone verification call.",
            "intake": intake,
            "route_card": [],
        }

    # Top 3 routes
    top = cards[:3]
    # US avg for comparison
    us_avg = US_AVG.get(scenario.title(), cards[0]["us_avg"] if cards else 0)
    if intake.get("us_quote"):
        try:
            us_avg = float(intake["us_quote"])
        except ValueError:
            pass

    verified = [c for c in top if c["freshness_status"] in ("fresh","aging")]
    route_card = []
    for i, c in enumerate(verified[:3], 1):
        sav = us_avg - c["price_low"] if us_avg > 0 else 0
        sav_pct = (sav / us_avg * 100) if us_avg > 0 else 0
        route_card.append({
            "rank": i,
            "clinic_id": c["clinic_id"],
            "clinic_name": c["clinic_name"],
            "clinic_url": c["clinic_url"],
            "clinic_address": c["address"],
            "phone": "(pending DB fill)",   # To be filled from DB
            "procedure": c["procedure"],
            "price_range": f"${c['price_low']:.0f}–${c['price_high'] or '?'}",
            "currency": c["currency"],
            "medpup_fee": "$25–$50" if c["category"] == "Surgery" else "$50–$100",
            "client_total": f"${c['price_low']:.0f}+MedPup fee",
            "us_comparison": f"${us_avg:.0f}",
            "savings_vs_us": f"${sav:.0f} ({sav_pct:.0f}%)",
            "drive_minutes": c["drive_minutes"],
            "needs_verification_call": c["freshness_status"] == "stale",
            "composite_score": c["composite_score"],
        })

    return {
        "status": "success",
        "intake": intake,
        "routed_scenario": scenario,
        "us_reference": us_avg,
        "clinics_evaluated": len(cards),
        "route_card": route_card,
        "call_to_action": "Reply 'BOOK IT' with your preferred clinic to confirm the appointment.",
    }

def format_human(card):
    lines = [
        f"\n╔══════════════════════════════════════════════════════════════╗",
        f"║              AUTOMATIC ROUTE CARD — MEDPUP                  ║",
        f"╚══════════════════════════════════════════════════════════════╝",
        f"\n  Procedure : {card['intake']['procedure']}",
        f"  Location  : {card['intake'].get('zip','Pinellas County')}",
        f"  U.S. quote : ${card['us_reference']:.0f} (your reference)\n",
    ]
    for opt in card["route_card"]:
        lines.append(f"  ┌── Route #{opt['rank']} ──────────────────────────────────────────")
        lines.append(f"  │  {opt['clinic_name']}")
        lines.append(f"  │  {opt['procedure']}: {opt['price_range']} + MedPup fee {opt['medpup_fee']}")
        lines.append(f"  │  U.S. comparison: ${opt['us_comparison']}  → save {opt['savings_vs_us']}")
        lines.append(f"  │  Drive: {opt['drive_minutes']} min from your area")
        lines.append(f"  │  Score: {opt['composite_score']:.3f}")
        if opt["needs_verification_call"]:
            lines.append(f"  │  ⚠️  VERIFICATION CALL NEEDED — pricing may be stale")
        lines.append(f"  └─────────────────────────────────────────────────────────────\n")
    lines.append(f"  {card['call_to_action']}")
    return "\n".join(lines)

if __name__ == "__main__":
    argp = argparse.ArgumentParser()
    argp.add_argument("intake_json", nargs="?", help="Path to intake JSON file")
    argp.add_argument("--scenario", help="Direct scenario override")
    argp.add_argument("--zip", default="33701", help="Client zip code")
    argp.add_argument("--us-quote", type=float, help="Client's existing US quote")
    argp.add_argument("--json", action="store_true", help="Output as JSON")
    args = argp.parse_args()

    if args.intake_json:
        intake = load_intake(args.intake_json)
    else:
        intake = INTAKE_SCHEMA.copy()

    if args.scenario:
        intake["procedure"] = args.scenario
    if args.zip:
        intake["zip_code"] = args.zip
    if args.us_quote:
        intake["us_quote"] = args.us_quote

    card = build_route_card(intake)

    if args.json or "application/json" in sys.argv[0]:
        print(json.dumps(card, indent=2))
    else:
        print(format_human(card))
