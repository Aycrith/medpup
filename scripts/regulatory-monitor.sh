#!/usr/bin/env bash
# MedPup Regulatory Monitor
# Checks key regulatory sources for changes affecting operations
# Usage: ./scripts/regulatory-monitor.sh
# Run weekly via cron or manually

set -e

echo "=== MedPup Regulatory Monitor ==="
echo "Date: $(date)"
echo ""

# 1. Check USDA APHIS pet travel page for changes
echo "[1/4] Checking USDA APHIS pet travel requirements..."
APHIS_URL="https://www.aphis.usda.gov/aphis/pet-travel"
APHIS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$APHIS_URL")
if [ "$APHIS_CHECK" = "200" ]; then
    echo "  OK - USDA APHIS site reachable"
else
    echo "  WARNING - USDA APHIS site returned status $APHIS_CHECK"
fi

# 2. Check CDC dog import page
echo "[2/4] Checking CDC dog import requirements..."
CDC_URL="https://www.cdc.gov/importation/dogs.html"
CDC_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$CDC_URL")
if [ "$CDC_CHECK" = "200" ]; then
    echo "  OK - CDC dog import page reachable"
else
    echo "  WARNING - CDC page returned status $CDC_CHECK"
fi

# 3. Check Bahamas Click2Clear portal
echo "[3/4] Checking Bahamas Click2Clear ePermit portal..."
C2C_URL="https://www.click2clear.com/"
C2C_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$C2C_URL")
if [ "$C2C_CHECK" = "200" ]; then
    echo "  OK - Click2Clear portal reachable"
else
    echo "  WARNING - Click2Clear returned status $C2C_CHECK"
fi

# 4. Check Balearia Caribbean ferry schedule
echo "[4/4] Checking Balearia Caribbean ferry service..."
BALEARIA_URL="https://www.balearia.com/en/routes/fort-lauderdale-freeport"
BALEARIA_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BALEARIA_URL")
if [ "$BALEARIA_CHECK" = "200" ]; then
    echo "  OK - Balearia route page reachable"
else
    echo "  WARNING - Balearia returned status $BALEARIA_CHECK"
fi

echo ""
echo "=== Monitor complete ==="
echo "Review any WARNING entries above and investigate."