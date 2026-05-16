#!/usr/bin/env bash
# MedPup Local Server
# Serves the built website from website/public/ via Python HTTP server
# Usage: ./scripts/serve-local.sh [port]
# Default port: 8080

set -e

PORT="${1:-8080}"
SITE_DIR="$(cd "$(dirname "$0")/../website/public" && pwd)"

if [ ! -f "$SITE_DIR/index.html" ]; then
    echo "No built site found at $SITE_DIR"
    echo "Run './scripts/build-website.sh' first."
    exit 1
fi

echo "Starting MedPup local server..."
echo ""
echo "  Serving:  $SITE_DIR"
echo "  URL:      http://localhost:$PORT"
echo "  Press Ctrl+C to stop."
echo ""

cd "$SITE_DIR"
python -m http.server "$PORT"