#!/bin/bash
set -e

echo "→ Running PM2 processes:"
pm2 list

echo ""
read -p "Enter app name or id to update: " TARGET

# ─── Sitemap ──────────────────────────────────────────────────────────────────
echo "→ Generating sitemap..."
node scripts/generate-sitemap.mjs

# ─── Build ────────────────────────────────────────────────────────────────────
echo "→ Building..."
npm run build

# ─── Copy static assets to standalone ────────────────────────────────────────
echo "→ Copying static assets to standalone..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# ─── Restart ──────────────────────────────────────────────────────────────────
echo "→ Restarting $TARGET..."
pm2 restart "$TARGET"

echo ""
echo "✓ Update complete → $TARGET"
