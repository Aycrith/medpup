#!/usr/bin/env bash
# honeypot_run.sh — autonomous pricing discovery for clinics with no published data
# Targets: Operation SNIP, RemedyFL, Thomasville Humane, Humane Society of Pinellas,
#          Humane Society of Tampa Bay, ASPCA CVC, Good Care Animal Clinic,
#          Paws 2 Help, Justin Bartlett, Heroes Veterinary
# Run: cd /c/Users/camer/DEVNEW/animalaid && python3 price_intel_v3.py run_honeypot

set -e

BASE="/c/Users/camer/DEVNEW/animalaid"
DB="$BASE/pricing_intel_v3.db"
SCRIPT="$BASE/price_intel_v3.py"

echo "=== Pinellas Phase 1 Honeypot ==="
echo "Running autonomous pricing discovery for clinics with no published data..."
echo ""

python "$SCRIPT" scan --all 2>&1 | tail -30

echo ""
echo "=== Exporting results ==="
python "$SCRIPT" database --export-json 2>&1
python "$SCRIPT" database --report 2>&1 | tail -40

echo ""
echo "=== Honeypot complete ==="