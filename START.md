# 🎯 Quick Start Guide - Kids Points App

## ⚡ Installation Rapide

### 1️⃣ Installer les dépendances

```bash
cd /Users/pOwn3d/Downloads/kids-points-app
npm install --legacy-peer-deps
```

### 2️⃣ Démarrer le Backend (dans un nouveau terminal)

```bash
cd /Users/pOwn3d/Desktop/DEVELOPPEMENT/PERSO/Kids_HA_BACK
symfony server:start --port=8000
```

### 3️⃣ Démarrer l'Application

```bash
cd /Users/pOwn3d/Downloads/kids-points-app
npx expo start
```

## 🖥️ Options de lancement

Après avoir lancé `npx expo start`, vous verrez un QR code et des options :

- **`w`** → Ouvrir dans le navigateur web (Desktop)
- **`i`** → Ouvrir dans iOS Simulator
- **`a`** → Ouvrir dans Android Emulator
- **QR Code** → Scanner avec Expo Go sur votre téléphone

## ✅ Vérification

1. **Backend API** : http://localhost:8000/api/docs
2. **Expo DevTools** : http://localhost:19002
3. **Application Web** : http://localhost:19006

## 🔧 En cas de problème

### Erreur "Module not found"
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

### Port 8000 déjà utilisé
```bash
# Trouver et tuer le processus
lsof -i :8000
kill -9 [PID]
```

### Cache Metro
```bash
npx expo start -c
```

## 📱 Test sur Mobile

1. Installer **Expo Go** sur votre téléphone
2. Scanner le QR code affiché dans le terminal
3. S'assurer que le téléphone et l'ordinateur sont sur le même réseau

## 🎨 Comptes de test

### Parent
- Email: `parent@example.com`
- Password: `password123`
- PIN: `1234`

### Enfants de test
- Créés automatiquement après connexion parent

## 🚀 C'est parti !

L'application est maintenant prête à être utilisée. Profitez de toutes les fonctionnalités de gamification ! 🎮