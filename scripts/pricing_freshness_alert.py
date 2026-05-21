#!/usr/bin/env python3
"""
pricing_freshness_alert.py — MedPup daily pricing freshness check
TTL rules: published=90d, estimated=60d, call_verified=7d, else=9999d (no op)
Exits 0 if clean, 1 if any newly stale records found.
Outputs pricing_alerts.json with full stale roster.

Usage:
    python scripts/pricing_freshness_alert.py          # run + print
    python scripts/pricing_freshness_alert.py --quiet   # only write JSON
"""
import sqlite3, json, sys
from pathlib import Path
from datetime import datetime

DB    = Path(__file__).parent.parent / "pricing_intel_v3.db"
OUT   = Path(__file__).parent.parent / "pricing_alerts.json"
TTL   = {"published": 90, "estimated": 60, "call_verified": 7}

QUERY = """
SELECT c.name, c.url, p.procedure_name, p.price_low, p.price_high,
       p.source, p.confidence, p.discovered_at
FROM pricing p JOIN clinics c ON p.clinic_id = c.id
"""

def main():
    quiet = "--quiet" in sys.argv
    now   = datetime.now()
    con   = sqlite3.connect(str(DB))
    cur   = con.cursor()
    cur.execute(QUERY)
    rows  = cur.fetchall()
    con.close()

    stale = []
    for (name, url, proc, lo, hi, src, conf, disc) in rows:
        if disc is None:
            age, label = 9999, "unknown"
        else:
            found = datetime.fromisoformat(disc[:10])
            age   = (now - found).days
            label = src if src in TTL else "unknown"
        ttl = TTL.get(label, 9999)
        if age > ttl:
            stale.append({
                "clinic": name, "url": url, "procedure": proc,
                "price": f"${lo}–$???",
                "source": src, "confidence": conf,
                "discovered_at": disc, "age_days": age, "ttl_days": ttl,
            })

    prev = json.loads(OUT.read_text()) if OUT.exists() else {"alerts": []}
    old_set = {(a["clinic"], a["procedure"]) for a in prev.get("alerts", [])}
    new_set = {(a["clinic"], a["procedure"]) for a in stale}
    newly   = new_set - old_set

    report = {
        "last_run": now.isoformat(),
        "summary": {"total": len(rows), "stale": len(stale), "newly_stale": len(newly)},
        "alerts": stale,
        "newly_stale": [{"clinic": c, "procedure": p} for c, p in newly],
    }
    OUT.write_text(json.dumps(report, indent=2))

    if not quiet:
        print(f"Pricing Freshness — {now.strftime('%Y-%m-%d %H:%M')}")
        print(f"  Total records: {len(rows)}   Stale: {len(stale)}   Newly stale: {len(newly)}")
        if stale:
            print("\\nSTALE RECORDS")
            for a in stale:
                flag = "NEW" if (a["clinic"], a["procedure"]) in newly else "   "
                print(f"  {flag} {a['clinic']:<40} {a['procedure']:<28} age={a['age_days']}d ttl={a['ttl_days']}d")

    return 1 if stale else 0

if __name__ == "__main__":
    sys.exit(main())
