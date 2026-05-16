#!/usr/bin/env bash
# MedPup Go-Bag Checklist
# Usage: ./scripts/go-bag-check.sh
# Run before every trip to verify Go-Bag is fully stocked

set -e

echo "=== MedPup Go-Bag Pre-Trip Check ==="
echo "Date: $(date)"
echo ""

ITEMS=(
    "MedPup polo shirt (bright blue)|1|Clean, pressed"
    "Printed client roster and itinerary|1 per trip|Laminated"
    "Printed emergency contact sheet|1|"
    "Backup battery pack + charging cables|1|20,000 mAh minimum"
    "Paper copies of all pet permits|1 set|In waterproof sleeve"
    "Client wristbands/IDs|5|Any color"
    "Poop bags|10+|"
    "Pee pads|5|For carrier accidents"
    "Disposable gloves|4 pairs|"
    "Basic first aid kit (human)|1|Band-aids, ibuprofen, hand sanitizer"
    "Dog first aid: styptic powder, vet wrap, gauze|1 each|"
    "Portable water bowl + water bottle|1|"
    "High-value treats (soft, small)|1 bag|For anxious dogs"
    "Pen + Sharpie + clipboard|1 each|"
    "Seasickness tablets (human)|6|Meclizine or Dramamine"
    "Printed copies of Client Service Agreements|1 set|"
    "Emergency cash ($100)|1|Small bills"
    "Ferry/flight tickets (printed)|1 set|"
    "Snack bars for concierge|3|Long day"
)

MISSING=0
for item in "${ITEMS[@]}"; do
    IFS='|' read -r name qty notes <<< "$item"
    echo -n "  [ ] $name (x$qty)"
    if [ -n "$notes" ]; then
        echo -n " - $notes"
    fi
    echo ""
    MISSING=$((MISSING + 1))
done

echo ""
echo "Total items to verify: $MISSING"
echo "Mark each [ ] with [X] when confirmed packed."
echo "=== Check complete ==="