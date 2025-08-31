# 🚀 Installation Guide - Kids Points App

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Installation Steps

### 1. Install Dependencies

```bash
# Navigate to project directory
cd /Users/pOwn3d/Downloads/KIDS/kids-points-app

# Install dependencies
npm install

# If you encounter peer dependency issues
npm install --legacy-peer-deps
```

### 2. iOS Specific Setup (Mac only)

```bash
# Install iOS dependencies
cd ios && pod install && cd ..
```

### 3. Start the Backend Server

```bash
# In a separate terminal
cd /Users/pOwn3d/Desktop/DEVELOPPEMENT/PERSO/Kids_HA_BACK

# Start Symfony server
symfony server:start --port=8000
```

### 4. Configure API URL

If testing on a physical device, update the API URL in `src/services/api/config.ts`:

```typescript
// Replace with your machine's IP address
const API_URL = 'http://YOUR_IP:8000/api';
```

### 5. Start the Application

```bash
# Start Expo
npx expo start

# Options:
# Press 'w' - Open in web browser (Desktop)
# Press 'i' - Open in iOS Simulator
# Press 'a' - Open in Android Emulator
# Scan QR code - Open on physical device with Expo Go
```

## Troubleshooting

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start -c
```

### Metro bundler issues

```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### iOS build issues

```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android build issues

```bash
# Clean build
cd android
./gradlew clean
cd ..
```

## Development Tips

1. **Hot Reload**: Enabled by default, shake device or press 'r' to reload
2. **Debug Menu**: Shake device or Cmd+D (iOS) / Cmd+M (Android)
3. **React DevTools**: Install globally with `npm install -g react-devtools`
4. **Network Inspection**: Use Flipper or React Native Debugger

## Build for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web

```bash
npx expo export:web
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Expo CLI not found | `npm install -g expo-cli` |
| Port 8000 in use | Change backend port or kill process |
| API connection failed | Check API URL and network |
| Missing assets | Add placeholder images to assets/ |
| Type errors | Run `npm run type-check` |

## Support

For issues, check:
- Documentation: `/doc` folder
- API Docs: http://localhost:8000/api/docs
- Expo Docs: https://docs.expo.dev