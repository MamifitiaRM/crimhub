#!/bin/bash
echo "🎨 Démarrage du frontend CrimeHub..."
cd "$(dirname "$0")/frontend"
if [ ! -d node_modules ]; then
  echo "📦 Installation des dépendances frontend..."
  npm install
fi
npm start
