#!/usr/bin/env bash
# MedPup website — local preview server
# Usage: cd website && ./serve.sh

echo "Starting MedPup Hugo dev server..."
echo "Open http://localhost:1313 in your browser."
echo "Press Ctrl+C to stop."
hugo server --buildDrafts --disableFastRender
