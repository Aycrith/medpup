#!/usr/bin/env bash
# MedPup Website Build Script
# Usage: ./scripts/build-website.sh [--serve]
#   --serve    Start dev server instead of building

set -e

SITE_DIR="$(cd "$(dirname "$0")/../website" && pwd)"
cd "$SITE_DIR"

if [ "$1" = "--serve" ]; then
    echo "Starting MedPup Hugo dev server..."
    echo "Open http://localhost:1313 in your browser."
    echo "Press Ctrl+C to stop."
    hugo server --buildDrafts --disableFastRender
else
    echo "Building MedPup website..."
    hugo --minify
    echo ""
    echo "Build complete! Output: $SITE_DIR/public/"
    echo "Total pages: $(find public -name 'index.html' | wc -l)"
fi