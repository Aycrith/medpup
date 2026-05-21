"""
real_cost_calculator.py — MedPup's core value tool
Takes a clinic's marketing price and produces a realistic "out-the-door"
estimate by:
  1. Applying procedure-specific reality multiplier (from client reports)
  2. Adding mandatory add-ons per procedure category
  3. Listing what's included vs. typically excluded
  4. Returning a MIN / MAX realistic range the client should budget

This is the answer to "anyone can google the $40 spay price."

Usage:
  python real_cost_calculator.py --procedure "Dental Cleaning" --price-low 285 --price-high 595
  python real_cost_calculator.py --procedure "Spay"            --price-low 40 --price-high 80
  python real_cost_calculator.py --json (machine-readable output)
"""
import json, argparse
from pathlib import Path

BASE = Path(r"C:\Users\camer\DEVNEW\animalaid")

# ── Reality: what ACTUALLY gets added (from client reports, Reddit/vet forums) ──
REALITY_MULTIPLIERS = {
    "Spay/Neuter":        {"min": 2.5, "max": 3.0, "typical_markup_src": "blood_work+pain_meds+e_collar"},
    "Spay":               {"min": 2.5, "max": 3.0, "typical_markup_src": "blood_work+pain_meds+e_collar"},
    "Neuter":             {"min": 2.5, "max": 3.0, "typical_markup_src": "blood_work+pain_meds+e_collar"},
    "Dental Cleaning":    {"min": 2.0, "max": 4.0, "typical_markup_src": "per_tooth_extractions+X-rays+monitor+IV"},
    "Dental":             {"min": 2.0, "max": 4.0, "typical_markup_src": "per_tooth_extractions+X-rays+monitor+IV"},
    "Mass Removal":       {"min": 1.6, "max": 2.5, "typical_markup_src": "histopathology+report"},
    "Surgery":            {"min": 1.7, "max": 3.0, "typical_markup_src": "anesthesia_upgrade+pain_management"},
    "Pyometra Surgery":   {"min": 1.5, "max": 2.2, "typical_markup_src": "pain_meds+overnight+follow_up"},
    "Entropion Repair":   {"min": 1.6, "max": 2.5, "typical_markup_src": "anesthesia+pain_management"},
    "Cherry Eye Repair":  {"min": 1.6, "max": 2.5, "typical_markup_src": "anesthesia+pain_management"},
    "Vaccination":        {"min": 1.4, "max": 2.0, "typical_markup_src": "exam_fee"},
    "Microchip":          {"min": 1.4, "max": 2.0, "typical_markup_src": "exam+registration_fee"},
    "Consultation":      {"min": 1.8, "max": 2.5, "typical_markup_src": "diagnostic_workup"},
    "Exam":               {"min": 1.5, "max": 2.0, "typical_markup_src": "treatment_plan_recommendation"},
    "Health Certificate": {"min": 1.3, "max": 1.8, "typical_markup_src": "travel_forms+timing_window"},
    "Deworming":          {"min": 1.6, "max": 2.2, "typical_markup_src": "fecal_test_required_first"},
}

MANDATORY_ADDONS = {
    "Spay": [
        ("Pre-op blood work", 60, 120),
        ("Pain medication (take-home)", 30, 80),
        ("E-collar / recovery cone", 15, 30),
        ("Post-op recheck (your vet)", 40, 80),
    ],
    "Neuter": [
        ("Pre-op blood work", 60, 120),
        ("Pain medication (take-home)", 30, 80),
        ("E-collar / recovery cone", 15, 30),
        ("Post-op recheck (your vet)", 40, 80),
    ],
    "Dental Cleaning": [
        ("Per-tooth extractions (est. 2–4 teeth)", 160, 1000),
        ("Dental X-rays (required)", 50, 100),
        ("Anesthesia monitor", 40, 80),
        ("IV catheter / fluids", 20, 40),
        ("Fluoride treatment / sealant", 30, 60),
        ("Post-op meds / antibiotics", 25, 50),
    ],
    "Mass Removal": [
        ("Histopathology / biopsy (usually required)", 80, 300),
        ("Drain placement if wound is deep", 50, 100),
        ("Histopath report follow-up visit", 40, 80),
    ],
    "Surgery": [
        ("Anesthesia tier upgrade", 50, 200),
        ("Pain management / take-home meds", 40, 100),
        ("E-collar / recovery cone", 15, 30),
        ("Post-op recheck (your vet)", 40, 80),
    ],
}

def realistic_range(label, price_low, price_high=None):
    mult = REALITY_MULTIPLIERS.get(label, {"min": 1.8, "max": 2.5, "typical_markup_src": "varies_by_procedure"})
    lo = round(price_low * mult["min"])
    hi = round((price_high or price_low) * mult["max"])
    addon_lo = sum(a[1] for a in MANDATORY_ADDONS.get(label, []))
    addon_hi = sum(a[2] for a in MANDATORY_ADDONS.get(label, []))
    guaranteed_min = lo + addon_lo
    possible_max = hi + addon_hi
    return {
        "procedure": label,
        "marketing_price": f"${price_low:.0f}–${price_high or price_low:.0f}",
        "multiplier_range": f"{mult['min']}×–{mult['max']}×",
        "typical_markup_source": mult["typical_markup_src"],
        "base_range_low": lo, "base_range_high": hi,
        "addon_range_low": addon_lo, "addon_high": addon_hi,
        "guaranteed_minimum": guaranteed_min,
        "possible_maximum": possible_max,
        "buffer_room_high": possible_max - (price_high or price_low),
        "mandatory_addons": MANDATORY_ADDONS.get(label, []),
    }

def format_screen(cards):
    lines = [
        "\n═" * 63,
        "  MEDPUP REAL COST CALCULATOR",
        "═" * 63,
    ]
    for c in cards:
        lines.append(f"\n  {c['procedure'].upper()}")
        lines.append(f"  ──────────────────────────────────────────────────────")
        lines.append(f"  Marketing price:     {c['marketing_price']}")
        lines.append(f"  Realistic range:     ${c['guaranteed_minimum']}–${c['possible_maximum']}")
        lines.append(f"  Markup source:       {c['typical_markup_source']}")
        lines.append(f"")
        if c["mandatory_addons"]:
            lines.append(f"  What's typically ADDED (not in marketing price):")
            for name, lo, hi in c["mandatory_addons"]:
                lines.append(f"    ⚠  {name:<32} (+${lo}–${hi})")
        else:
            lines.append(f"  ⚠  No clinic includes blood work, meds, e-collar, or post-op check")
        lines.append(f"\n  MedPup all-in guarantee: we confirm the ${c['guaranteed_minimum']}–${c['possible_maximum']}")
        lines.append(f"  figure before you book. If the final bill exceeds our")
        lines.append(f"  confirmed range, we find you a backup clinic — at no cost.\n")

    lines.append("═" * 63)
    return "\n".join(lines)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--procedure", help="Procedure name (e.g. 'Dental Cleaning')")
    ap.add_argument("--price-low", type=float, help="Low end of marketing price")
    ap.add_argument("--price-high", type=float, help="High end of marketing price")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    cards = []
    if args.procedure and args.price_low:
        cards.append(realistic_range(args.procedure, args.price_low, args.price_high))
    else:
        # Demo: show top 5 procedures from DB
        demo_procs = [
            ("Spay/Neuter", 40, 80),
            ("Dental Cleaning", 285, 595),
            ("Mass Removal", 450, 450),
            ("Pyometra Surgery", 1300, 1900),
            ("Surgery", 650, 2100),
        ]
        cards = [realistic_range(p, lo, hi) for p, lo, hi in demo_procs]

    if args.json:
        print(json.dumps(cards, indent=2))
    else:
        print(format_screen(cards))
