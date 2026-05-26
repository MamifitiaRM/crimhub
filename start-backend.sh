#!/bin/bash
echo "🦹 Démarrage du backend CrimeHub..."
cd "$(dirname "$0")/backend"
if [ ! -d node_modules ]; then
  echo "📦 Installation des dépendances backend..."
  npm install
fi
npm run dev
