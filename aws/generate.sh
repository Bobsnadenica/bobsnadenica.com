#!/bin/bash
# Simple launcher to regenerate AWS scripts index
# Double-clickable on macOS Finder

cd "$(dirname "$0")/scripts" || exit 1

echo "🔍 Generating scripts index..."
node generate_scripts_index.js

echo "✅ Done! Press any key to close."
read -n 1 -s