"""
price_guarantee.py — MedPup Surprise Bill Guarantee
If final clinic bill exceeds our all-in confirmation estimate,
MedPup covers the excess.
Usage:
  python price_guarantee.py --procedure dental --confirmed-low 895 --confirmed-high 3710 --final-bill 4200
  python price_guarantee.py --check  # run demo scenarios
"""
import argparse
from pathlib import Path

REALITY_MULTIPLIERS = {
    "Spay/Neuter":      (2.5, 3.0),
    "Neuter":           (2.5, 3.0),
    "Spay":             (2.5, 3.0),
    "Dental Cleaning":  (2.0, 4.0),
    "Dental":           (2.0, 4.0),
    "Mass Removal":     (1.6, 2.5),
    "Surgery":          (1.7, 3.0),
    "Pyometra Surgery": (1.5, 2.2),
    "Entropion Repair": (1.6, 2.5),
    "Cherry Eye Repair":(1.6, 2.5),
}

MANDATORY_ADDONS = {
    "Spay":            [("Blood work",60,120),("Pain meds",30,80),("E-collar",15,30),("Post-op check",40,80)],
    "Dental Cleaning": [("Per-tooth extractions",160,1000),("Dental X-rays",50,100),("Anesthesia monitor",40,80),("IV/fluids",20,40),("Fluoride",30,60),("Post-op meds",25,50)],
    "Mass Removal":    [("Histopathology",80,300),("Drain placement",50,100),("Histopath follow-up",40,80)],
    "Surgery":         [("Anesthesia upgrade",50,200),("Pain meds",40,100),("E-collar",15,30),("Post-op check",40,80)],
}

def allin_estimate(procedure, price_low, price_high=None):
    rng = REALITY_MULTIPLIERS.get(procedure, (1.7, 2.5))
    low = price_low * rng[0]
    hi = (price_high or price_low) * rng[1]
    addons = MANDATORY_ADDONS.get(procedure, [])
    addon_low = sum(a[1] for a in addons)
    addon_hi = sum(a[2] for a in addons)
    return round(low), round(hi), addon_low, addon_hi

def evaluate(procedure, confirmed_low, confirmed_high, final_bill, fee=75):
    excess = max(0, final_bill - confirmed_high)
    if excess <= 0:
        return {"verdict":"OK","excess":0,"medpup_owes":0,"action":None,"summary":"Within confirmed range — no guarantee triggered."}
    covered_by_fee = min(excess, fee)
    balanced = max(0, excess - fee)
    if balanced == 0:
        return {"verdict":"COVERED BY FEE","excess":excess,"medpup_owes":covered_by_fee,
                "action":"Refund excess to client","summary":f"Excess of ${excess} covered by coordination fee — refund the difference."}
    return {"verdict":"BACKUP CLINIC REQUIRED","excess":excess,"medpup_owes":fee+balanced,
            "action":f"Find backup clinic, refund ${fee} fee, cover ${balanced} difference",
            "summary":f"Excess ${excess} exceeds coordination fee. Client routed to backup clinic at no additional cost."}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--procedure")
    ap.add_argument("--confirmed-low", type=float)
    ap.add_argument("--confirmed-high", type=float)
    ap.add_argument("--final-bill", type=float)
    ap.add_argument("--fee", type=float, default=75)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if args.check:
        scenarios = [
            ("Dental Cleaning", 895, 3710, 2400),
            ("Dental Cleaning", 895, 3710, 4800),
            ("Spay/Neuter", 100, 240, 180),
            ("Spay/Neuter", 100, 240, 600),
        ]
        for s in scenarios:
            g = evaluate(*s)
            print(f"\n  {s[0]}: marketing ${s[1]}–{s[2]},  final bill ${s[3]}")
            print(f"  → {g['verdict']:<28} excess=${g['excess']}  MedPup owes: ${g['medpup_owes']}")
            print(f"     {g['summary']}")
    elif args.procedure and args.confirmed_low:
        allin_low, allin_hi, _, _ = allin_estimate(args.procedure, args.confirmed_low, args.confirmed_high)
        g = evaluate(args.procedure, allin_low, allin_hi, args.final_bill or allin_hi, args.fee)
        print(f"\n  Procedure:  {args.procedure}")
        print(f"  Marketing:  ${args.confirmed_low:.0f}–{args.confirmed_high or args.confirmed_low:.0f}")
        print(f"  All-in:     ${allin_low}–{allin_hi}")
        print(f"  Final bill: ${args.final_bill or 'not specified'}")
        print(f"  Verdict:    {g['verdict']}")
        print(f"  {g['summary']}")
