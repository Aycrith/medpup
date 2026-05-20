#!/usr/bin/env bash
# =============================================================================
# MedPup Local Platform — Start Script
# =============================================================================
# Starts everything needed to run MedPup locally: CRM server + website.
# No cloud dependencies. No costs.
#
# Usage:
#   ./scripts/start.sh              Start CRM server + background Hugo
#   ./scripts/start.sh --crm-only   Only CRM server (no website)
#   ./scripts/start.sh --web-only   Only website dev server (no CRM)
#   ./scripts/start.sh --build      Build website only, no servers
#
# After starting:
#   CRM Dashboard:  http://localhost:8080/dashboard
#   Intake Form:    http://localhost:8080
#   Website:        http://localhost:1313
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

CRM_PORT=8080
HUGO_PORT=1313

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
TEAL='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${TEAL}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║       MedPup Local Platform         ║"
echo "  ║    Zero cost. Zero cloud. Zero BS.   ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Parse args ────────────────────────────────────────
CRM_ONLY=false
WEB_ONLY=false
BUILD_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --crm-only) CRM_ONLY=true ;;
        --web-only) WEB_ONLY=true ;;
        --build) BUILD_ONLY=true ;;
    esac
done

# ── Ensure data dirs ──────────────────────────────────
mkdir -p "$ROOT_DIR/server/static"
if [ ! -f "$ROOT_DIR/server/leads.json" ]; then
    echo "[]" > "$ROOT_DIR/server/leads.json"
    echo -e "  ${GREEN}✓${NC} Created leads.json"
fi

# ── Build website (always available) ──────────────────
if [ "$BUILD_ONLY" = true ]; then
    echo ""
    echo "  Building website..."
    cd "$ROOT_DIR/website"
    hugo --minify 2>&1 | tail -5
    echo -e "  ${GREEN}✓${NC} Website built to website/public/"
    echo ""
    echo "  Total pages: $(find public -name 'index.html' | wc -l)"
    exit 0
fi

# ── Start CRM server ─────────────────────────────────
start_crm() {
    echo ""
    echo "  [1/2] Starting CRM server..."
    cd "$ROOT_DIR"

    # Kill any existing CRM server
    lsof -ti:$CRM_PORT 2>/dev/null | xargs kill 2>/dev/null || true
    sleep 0.5

    # Start in background
    nohup python server/main.py > "$ROOT_DIR/server/crm.log" 2>&1 &
    CRM_PID=$!
    echo "$CRM_PID" > "$ROOT_DIR/server/.pid"

    # Wait for it to come up
    for i in $(seq 1 10); do
        if curl -s http://localhost:$CRM_PORT/ > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} CRM server running on http://localhost:$CRM_PORT (PID: $CRM_PID)"
            break
        fi
        sleep 0.5
    done
}

# ── Start Hugo dev server ────────────────────────────
start_web() {
    echo ""
    echo "  [2/2] Starting website dev server..."
    cd "$ROOT_DIR/website"

    # Kill any existing Hugo server
    lsof -ti:$HUGO_PORT 2>/dev/null | xargs kill 2>/dev/null || true
    sleep 0.5

    nohup hugo server --buildDrafts --disableFastRender > "$ROOT_DIR/website/hugo.log" 2>&1 &
    HUGO_PID=$!

    for i in $(seq 1 10); do
        if curl -s http://localhost:$HUGO_PORT/ > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Website running on http://localhost:$HUGO_PORT (PID: $HUGO_PID)"
            break
        fi
        sleep 0.5
    done
}

# ── Execute ───────────────────────────────────────────
if [ "$CRM_ONLY" = true ]; then
    start_crm
elif [ "$WEB_ONLY" = true ]; then
    start_web
else
    start_crm
    start_web
fi

echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "  ${TEAL}CRM Dashboard:${NC}  http://localhost:$CRM_PORT/dashboard"
echo -e "  ${TEAL}Intake Form:${NC}    http://localhost:$CRM_PORT"
echo -e "  ${TEAL}Website:${NC}        http://localhost:$HUGO_PORT"
echo -e "  ${TEAL}Email Sender:${NC}   python server/email-sender.py --help"
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Trap for cleanup
cleanup() {
    echo ""
    echo "  Shutting down..."
    if [ -f "$ROOT_DIR/server/.pid" ]; then
        kill $(cat "$ROOT_DIR/server/.pid") 2>/dev/null || true
        rm -f "$ROOT_DIR/server/.pid"
    fi
    lsof -ti:$HUGO_PORT 2>/dev/null | xargs kill 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} All servers stopped"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for interrupt
while true; do sleep 1; done
