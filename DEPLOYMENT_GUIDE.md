# 📱 Guide de Déploiement - Kids Points App

## 🍎 iOS - Installation sur iPhone

### Option 1: TestFlight (Recommandé)
**Prérequis:** Compte Apple Developer ($99/an)

```bash
# 1. Connexion à votre compte Apple
eas login

# 2. Build pour TestFlight
eas build --platform ios --profile testflight

# 3. Soumettre à TestFlight
eas submit -p ios --latest

# 4. Dans App Store Connect:
#    - Ajouter les testeurs par email
#    - Ils recevront une invitation TestFlight
#    - Valable 90 jours
```

### Option 2: Ad Hoc (Fichier .ipa direct)
**Prérequis:** Compte Apple Developer + UDIDs des appareils

```bash
# 1. Ajouter les UDIDs des appareils
eas device:create

# 2. Build Ad Hoc
eas build --platform ios --profile adhoc

# 3. Télécharger le .ipa depuis l'URL fournie

# 4. Installer sur iPhone via:
#    - Apple Configurator 2 (Mac)
#    - iTunes (Windows/Mac ancien)
#    - Outils MDM
```

### Option 3: Development Build (Gratuit)
**Sans compte Apple Developer**

```bash
# 1. Build de développement
eas build --platform ios --profile device

# 2. Scanner le QR code avec l'app Expo Go
# 3. Limitations: Expire après 7 jours
```

## 🌐 Web - Déploiement en ligne

### Déploiement automatique
```bash
# Utiliser le script de déploiement
./scripts/deploy-web.sh

# Choisir parmi:
# 1. Vercel (gratuit, recommandé)
# 2. Netlify (gratuit)
# 3. GitHub Pages (gratuit)
# 4. Test local
```

### Déploiement manuel sur Vercel
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Build de production
npx expo export --platform web --output-dir dist

# 3. Déployer
vercel --prod

# URL personnalisée disponible: https://kids-points.vercel.app
```

### Déploiement manuel sur Netlify
```bash
# 1. Build
npx expo export --platform web --output-dir dist

# 2. Drag & drop le dossier dist sur netlify.com
# OU via CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📊 Tableau comparatif

| Méthode | Coût | Durée validité | Nb appareils | Facilité |
|---------|------|----------------|--------------|----------|
| **TestFlight** | $99/an | 90 jours | 10,000 | ⭐⭐⭐⭐⭐ |
| **Ad Hoc** | $99/an | 1 an | 100 | ⭐⭐⭐ |
| **Dev Build** | Gratuit | 7 jours | Illimité | ⭐⭐ |
| **Web (Vercel)** | Gratuit | Permanent | Illimité | ⭐⭐⭐⭐⭐ |

## 🚀 Commandes rapides

```bash
# iOS TestFlight
eas build --platform ios --profile testflight && eas submit -p ios --latest

# iOS Ad Hoc
eas build --platform ios --profile adhoc

# Web production
./scripts/deploy-web.sh

# Test local web
npx expo start --web
```

## 📝 Notes importantes

1. **Certificats iOS**: EAS gère automatiquement les certificats
2. **Icônes**: Assurez-vous que `./assets/icon.png` est 1024x1024px
3. **Bundle ID**: `org.name.KidsPoints` (modifier si nécessaire)
4. **Version Web**: Accessible depuis n'importe quel navigateur moderne

## 🆘 Support

- [Documentation Expo](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction)
- [App Store Connect](https://appstoreconnect.apple.com)