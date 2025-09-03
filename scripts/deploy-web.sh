#!/bin/bash

# Script de déploiement web pour Kids Points

echo "🚀 Déploiement de Kids Points Web"
echo "=================================="

# Build de production
echo "📦 Build de production..."
npx expo export --platform web --output-dir dist

# Options de déploiement
echo ""
echo "Choisissez votre plateforme de déploiement:"
echo "1) Vercel (recommandé - gratuit)"
echo "2) Netlify" 
echo "3) GitHub Pages"
echo "4) Serveur local pour test"

read -p "Votre choix (1-4): " choice

case $choice in
  1)
    echo "📤 Déploiement sur Vercel..."
    npx vercel --prod --yes
    ;;
  2)
    echo "📤 Déploiement sur Netlify..."
    npx netlify deploy --prod --dir=dist
    ;;
  3)
    echo "📤 Déploiement sur GitHub Pages..."
    npx gh-pages -d dist
    ;;
  4)
    echo "🖥️ Lancement du serveur local..."
    npx serve dist -p 3000
    ;;
  *)
    echo "❌ Choix invalide"
    exit 1
    ;;
esac