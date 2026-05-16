#!/usr/bin/env bash
# MedPup Trip Log Generator
# Usage: ./scripts/new-trip-log.sh
# Creates a new trip log file with today's date

set -e

LOGS_DIR="$(cd "$(dirname "$0")/../operations/trip-logs" && pwd)"
mkdir -p "$LOGS_DIR"

DATE=$(date +%Y-%m-%d)
FILE="$LOGS_DIR/trip-$DATE.md"

if [ -f "$FILE" ]; then
    echo "Trip log for $DATE already exists: $FILE"
    exit 1
fi

cat > "$FILE" << 'EOF'
# MedPup Trip Log

**Date:** [DATE]
**Destination:** Freeport, Grand Bahama / Cancun, Mexico
**Concierge:** [Name]
**Clients:** [Number] | **Pets:** [Number]

## Timeline
- Arrival at port/airport: [Time]
- Departure: [Time]
- Customs clearance (destination): [Time]
- Clinic arrival: [Time]
- Surgeries completed: [Time]
- Return to port/airport: [Time]
- U.S. Customs clearance: [Time]
- Final client departure: [Time]

## Incidents / Issues
- [None / Describe]

## Client Feedback
- [Quotes, suggestions, complaints]

## Clinic Feedback
- [Communication, timing, any concerns]

## Go-Bag Items Used / Need Restock
- [List]

## Lessons Learned for Next Trip
- [What to repeat, what to change]

## Financial Summary
- Concierge fees collected: $[Amount]
- Trip direct costs: $[Amount]
- Trip gross profit: $[Amount]
- Trip margin: [%]
EOF

echo "Created trip log: $FILE"