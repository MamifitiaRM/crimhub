#!/bin/bash
echo "🌱 Peuplement de la base de données..."
cd "$(dirname "$0")/backend"
if [ ! -d node_modules ]; then npm install; fi
node scripts/seed.js
