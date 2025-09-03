#!/bin/bash

echo "🌐 Building Kids Points Web App..."

# Build web version
npx expo export --platform web --output-dir dist

echo "✅ Web build complete in ./dist"
echo ""
echo "📦 Deploy options:"
echo "1. Vercel: vercel --prod"
echo "2. Netlify: netlify deploy --prod --dir=dist"
echo "3. GitHub Pages: Push to gh-pages branch"
echo "4. Static server: npx serve dist"