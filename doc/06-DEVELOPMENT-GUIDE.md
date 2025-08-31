# 🚀 Guide de Développement - Kids Points System

## 📋 Prérequis

### Backend (Symfony)
- PHP 8.2+
- Composer 2.x
- Symfony CLI
- PostgreSQL 15
- Node.js 18+ (pour assets)

### Frontend (Expo)
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) ou Android Emulator
- VS Code ou WebStorm

## 🏁 Installation et Configuration

### 1. Backend Setup

```bash
# Naviguer vers le backend
cd /Users/pOwn3d/Desktop/DEVELOPPEMENT/PERSO/Kids_HA_BACK

# Installer les dépendances
composer install

# Créer le fichier .env.local
cp .env .env.local

# Configurer la base de données dans .env.local
DATABASE_URL="postgresql://postgres:password@193.108.54.154:5432/kids_points?serverVersion=15&charset=utf8"

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les fixtures (données de test)
php bin/console doctrine:fixtures:load --no-interaction

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Démarrer le serveur
symfony server:start --port=8000
```

### 2. Frontend Setup

```bash
# Créer le projet Expo
cd /Users/pOwn3d/Downloads/KIDS
npx create-expo-app kids-points-app --template

# Naviguer dans le projet
cd kids-points-app

# Installer les dépendances principales
npm install @reduxjs/toolkit react-redux redux-persist
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/drawer @react-navigation/stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
npm install axios @tanstack/react-query
npm install native-base react-native-svg react-native-safe-area-context
npm install expo-secure-store expo-device expo-constants
npm install react-native-mmkv

# Installer les dépendances de développement
npm install -D @types/react @types/react-native typescript
npm install -D @babel/core @babel/preset-env
npm install -D eslint prettier eslint-config-prettier

# Démarrer l'application
npx expo start
```

## 📁 Structure du Projet Frontend

```bash
# Créer la structure de dossiers
mkdir -p src/{components,screens,navigation,services,store,hooks,utils,theme,types,assets}
mkdir -p src/components/{common,mobile,desktop}
mkdir -p src/screens/{auth,parent,child,shared}
mkdir -p src/services/{api,modules}
mkdir -p src/store/slices
```

### Fichiers de configuration

#### `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@store/*": ["src/store/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

#### `babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@store': './src/store',
          '@types': './src/types'
        }
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
```

## 🔧 Configuration de l'API Client

### `src/services/api/client.ts`
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'
  : 'https://api.kidspoints.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor pour refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refresh_token: refreshToken
        });
        
        const { token } = response.data;
        await SecureStore.setItemAsync('jwt_token', token);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Rediriger vers login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🎨 Configuration du Thème

### `src/theme/index.ts`
```typescript
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
    
    // Grayscale
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
```

## 🔄 Redux Store Setup

### `src/store/index.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import missionsReducer from './slices/missionsSlice';
import rewardsReducer from './slices/rewardsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'children'],
};

const rootReducer = {
  auth: persistReducer(persistConfig, authReducer),
  children: childrenReducer,
  missions: missionsReducer,
  rewards: rewardsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 🧪 Tests

### Configuration Jest

#### `jest.config.js`
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Exemple de test
```typescript
// src/services/__tests__/authService.test.ts
import { authService } from '../authService';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    const result = await authService.login(credentials);
    
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
  });
});
```

## 📱 Commandes de Développement

### Backend
```bash
# Démarrer le serveur
symfony server:start --port=8000

# Voir les logs
symfony server:log

# Lister les routes
php bin/console debug:router

# Clear cache
php bin/console cache:clear

# Créer une entité
php bin/console make:entity

# Créer un controller
php bin/console make:controller

# Générer une migration
php bin/console make:migration

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

### Frontend
```bash
# Démarrer Expo
npx expo start

# Démarrer avec clear cache
npx expo start -c

# Build iOS
npx expo run:ios

# Build Android
npx expo run:android

# Build Web
npx expo start --web

# Installer une dépendance Expo
npx expo install [package-name]

# Vérifier les dépendances
npx expo doctor

# Publier sur Expo Go
npx expo publish
```

## 🐛 Debugging

### Backend Debugging
```bash
# Symfony Profiler
http://localhost:8000/_profiler

# Dump variable
dump($variable); die;

# Logs
tail -f var/log/dev.log

# Database queries
php bin/console doctrine:query:sql "SELECT * FROM children"
```

### Frontend Debugging
```javascript
// Console logs
console.log('Debug:', data);

// React Native Debugger
// Cmd+D (iOS) ou Cmd+M (Android)

// Flipper
// https://fbflipper.com/

// React DevTools
npm install -g react-devtools
react-devtools
```

## 🚀 Déploiement

### Backend Deployment
```bash
# Production build
composer install --no-dev --optimize-autoloader
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
php bin/console assets:install --env=prod

# Database migrations
php bin/console doctrine:migrations:migrate --env=prod
```

### Frontend Deployment
```bash
# Build pour production
npx expo build:ios
npx expo build:android
npx expo build:web

# EAS Build (recommandé)
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
eas build --platform web

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📚 Ressources Utiles

### Documentation
- [Symfony Docs](https://symfony.com/doc/current/index.html)
- [API Platform Docs](https://api-platform.com/docs/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native](https://reactnative.dev/docs/getting-started)

### Outils
- [Postman](https://www.postman.com/) - Test API
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Debug tool
- [Reactotron](https://github.com/infinitered/reactotron) - Debug tool

## 🤝 Conventions de Code

### Git Flow
```bash
# Branches
main          # Production
develop       # Développement
feature/*     # Nouvelles fonctionnalités
bugfix/*      # Corrections de bugs
hotfix/*      # Corrections urgentes

# Commit messages
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Code Style
- **TypeScript** : Strict mode activé
- **ESLint** : Configuration Airbnb
- **Prettier** : Format automatique
- **Imports** : Absolute paths avec aliases

## 🔒 Sécurité

### Checklist Sécurité
- [ ] JWT tokens stockés de manière sécurisée
- [ ] PIN parental hashé
- [ ] Validation des inputs côté serveur
- [ ] HTTPS en production
- [ ] Rate limiting configuré
- [ ] CORS configuré correctement
- [ ] Environnement variables sécurisées
- [ ] Pas de secrets dans le code

## 📈 Monitoring

### Tools recommandés
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Amplitude/Mixpanel** - Analytics
- **New Relic** - Performance monitoring