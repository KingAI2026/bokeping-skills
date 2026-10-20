#!/usr/bin/env bash
# Builds dist/<skill>.zip for every skill: a ZIP holding the skill's folder
# with SKILL.md inside it, the layout Claude's "Upload a skill" expects.
set -euo pipefail

cd "$(dirname "$0")/.."
node scripts/validate.mjs

rm -rf dist
mkdir -p dist
cd skills
for dir in */; do
  skill="${dir%/}"
  zip -qr "../dist/${skill}.zip" "$skill" -x '*.DS_Store'
  echo "dist/${skill}.zip"
done
