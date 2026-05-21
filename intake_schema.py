"""
intake_schema.py — MedPup client intake schema + VOC save
Structured intake capture that feeds the routing engine and V cache.
"""
from pathlib import Path
import json, datetime

BASE = Path(r"C:\Users\camer\DEVNEW\animalaid")
VOC_DIR = BASE / "02_PHASES" / "voc"
VOC_DIR.mkdir(parents=True, exist_ok=True)

INTAKE_FIELDS = {
    # ── Identity ──────────────────────────────────────────────────
    "pet_name":           str,   # "Max"
    "pet_species":        str,   # dog / cat
    "pet_breed":          str,   # "Golden Retriever"
    "pet_age_years":      float, # 7.5
    "pet_weight_lbs":     float, # 65
    # ── Location / travel ─────────────────────────────────────────
    "zip_code":           str,   # "33701"
    "city":               str,   # "Largo"
    "travel_limit_min":   int,   # 90  (max drive client will tolerate)
    # ── Medical ───────────────────────────────────────────────────
    "procedure":          str,   # "Dental Cleaning + 3 extractions"
    "procedure_category": str,   # dental / spay / surgery / mass
    "vet_diagnosis":      str,   # free text
    "uspree_est_cost":    float, # 1800.00
    "carecredit_limit":   float, # if they have one
    # ── Urgency ───────────────────────────────────────────────────
    "urgency":            str,   # flexible / within_week / asap
    "needs_travel_coord": bool,  # false for Phase 1
    # ── Outcome tracking ───────────────────────────────────────────
    "routed_to_clinic_id":None,  # filled after routing
    "routed_to_clinic":   None,
    "appointment_booked": bool,
    "appointment_date":   str,
    "outcome":            None,  # confirmed / canceled / no_show / deferred
    "outcome_reason":     None,
}

def validate_intake(data):
    """Return (valid, errors)."""
    required = ["pet_name", "pet_species", "procedure", "zip_code", "uspree_est_cost"]
    errors = []
    for field in required:
        if field not in data or data[field] is None or data[field] == "":
            errors.append(f"Missing required field: {field}")
    return (len(errors) == 0, errors)

def save_intake(intake_data, intake_id=None):
    """Save intake to VOC directory as dated JSON."""
    if intake_id is None:
        intake_id = f"intake_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    enriched = {
        "intake_id": intake_id,
        "created_at": datetime.datetime.now().isoformat(),
        "status": "pending_routing",
        **intake_data,
    }
    path = VOC_DIR / f"{intake_id}.json"
    path.write_text(json.dumps(enriched, indent=2))
    return path, enriched

def load_intake(intake_id):
    path = VOC_DIR / f"{intake_id}.json"
    if path.exists():
        return json.loads(path.read_text())
    return None

def update_voc(intake_id, updates):
    """Update an existing intake with routing / outcome data."""
    data = load_intake(intake_id)
    if data:
        data.update(updates)
        data["updated_at"] = datetime.datetime.now().isoformat()
        path = VOC_DIR / f"{intake_id}.json"
        path.write_text(json.dumps(data, indent=2))
        return data
    return None

def print_schema():
    print("INTAKE SCHEMA — MedPup Client Intake\n")
    print("Required fields (must be present before routing):")
    req = ["pet_name", "pet_species", "procedure", "zip_code", "uspree_est_cost"]
    for f in req:
        ty = INTAKE_FIELDS[f].__name__
        print(f"  {f:<22} ({ty})")
    print("\nOptional fields:")
    for f, ty in INTAKE_FIELDS.items():
        if f not in req and not f.endswith("_id"):
            print(f"  {f:<22} ({ty.__name__})")
    print("\nOutcome tracking fields (filled post-routing):")
    for f, ty in INTAKE_FIELDS.items():
        if f.startswith("routed_to_") or f in ("appointment_booked","appointment_date","outcome","outcome_reason"):
            print(f"  {f:<22} ({ty.__name__ if ty is not None else 'optional'})")

def test_save():
    test_intake = {
        "pet_name": "Test Dog",
        "pet_species": "dog",
        "pet_breed": "Lab Mix",
        "pet_weight_lbs": 55,
        "zip_code": "33701",
        "city": "Largo",
        "procedure": "Dental Cleaning with extractions",
        "procedure_category": "dental",
        "uspree_est_cost": 1800.0,
        "urgency": "within_week",
        "needs_travel_coord": False,
    }
    ok, errs = validate_intake(test_intake)
    print(f"\nValidation: {'✅ PASS' if ok else '❌ FAIL'}")
    if errs:
        for e in errs: print(f"  {e}")
    path, data = save_intake(test_intake)
    print(f"\nSaved: {path.name}")
    print(json.dumps(data, indent=2)[:600])

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="MedPup intake schema + VOC reader")
    ap.add_argument("--schema", action="store_true", help="Print intake schema")
    ap.add_argument("--test", action="store_true", help="Run test save (demo)")
    ap.add_argument("--list", action="store_true", help="List all VOC records (summary table)")
    ap.add_argument("--show", type=str, metavar="INTAKE_ID", help="Show full JSON for one VOC record")
    ap.add_argument("--dir", type=str, default=str(VOC_DIR), help="VOC directory path")
    args = ap.parse_args()
    if args.schema:
        print_schema()
    if args.test:
        test_save()
    if args.list:
        import os
        voc_path = Path(args.dir)
        files = sorted(voc_path.glob("*.json"))
        if not files:
            print(f"\nNo VOC records found in {voc_path}")
        else:
            print(f"\n{'ID':<30} {'Status':<18} {'Pet':<16} {'Procedure':<20} {'Created'}")
            print("-" * 110)
            for f in files:
                d = json.loads(f.read_text())
                vid = d.get("intake_id", f.stem)
                status = d.get("status", "?")
                pet = d.get("pet_name", d.get("pet_species", "?"))
                proc = d.get("procedure", d.get("procedure_category", "?"))
                created = d.get("created_at", "?")[:19].replace("T", " ")
                print(f"{vid:<30} {status:<18} {pet:<16} {proc:<20} {created}")
            print(f"\nTotal: {len(files)} record(s)")
    if args.show:
        target = Path(args.dir) / f"{args.show}.json"
        if not target.exists():
            # Try with just the ID if user passed partial
            matches = [f for f in Path(args.dir).glob("*.json") if args.show in f.name or args.show in f.stem]
            if matches:
                target = matches[0]
            else:
                print(f"VOC record not found: {args.show}")
                exit(1)
        print(json.dumps(json.loads(target.read_text()), indent=2))
