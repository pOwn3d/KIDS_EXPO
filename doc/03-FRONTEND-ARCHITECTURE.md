# 📱 Architecture Frontend - Kids Points System

## 🎯 Objectif

Créer une application Expo cross-platform qui fonctionne parfaitement sur :
- **Mobile** (iOS/Android) - Interface tactile avec bottom tabs
- **Desktop/Web** - Interface desktop native avec sidebar latérale
- **Tablette** - Layout adaptatif hybride

## 🏗 Stack technique Frontend

### Framework principal
- **Expo SDK 50+** - Framework React Native unifié
- **React Native** - Core framework
- **TypeScript** - Typage statique

### Navigation
- **React Navigation 6** - Navigation principale
  - Stack Navigator - Navigation entre écrans
  - Bottom Tabs (Mobile) - Navigation mobile
  - Drawer Navigator (Desktop) - Sidebar desktop

### State Management
- **Redux Toolkit** - State management global
- **Redux Persist** - Persistance des données
- **React Query/TanStack Query** - Cache et synchronisation API

### UI Components
- **NativeBase** ou **Tamagui** - Composants cross-platform
- **React Native Elements** - Composants additionnels
- **Lottie** - Animations
- **React Native Reanimated 3** - Animations performantes

### Stockage local
- **AsyncStorage** - Stockage simple
- **MMKV** - Stockage performant
- **SecureStore** - Données sensibles (tokens)

## 📂 Structure du projet

```
kids-points-app/
├── src/
│   ├── components/           # Composants réutilisables
│   │   ├── common/          # Composants partagés
│   │   ├── mobile/          # Composants mobile only
│   │   └── desktop/         # Composants desktop only
│   ├── screens/             # Écrans de l'application
│   │   ├── auth/           # Authentification
│   │   ├── parent/         # Écrans parents
│   │   ├── child/          # Écrans enfants
│   │   └── shared/         # Écrans partagés
│   ├── navigation/          # Configuration navigation
│   │   ├── MobileNavigator.tsx
│   │   ├── DesktopNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── services/            # Services API
│   │   ├── api/            # Client API
│   │   ├── auth/           # Service auth
│   │   └── modules/        # Services par module
│   ├── store/              # Redux store
│   │   ├── slices/         # Redux slices
│   │   └── index.ts        # Store configuration
│   ├── hooks/              # Custom hooks
│   │   ├── useResponsive.ts
│   │   ├── usePlatform.ts
│   │   └── useApi.ts
│   ├── utils/              # Utilitaires
│   │   ├── responsive.ts   # Helpers responsive
│   │   └── platform.ts     # Detection plateforme
│   ├── theme/              # Thème et styles
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── types/              # Types TypeScript
│       ├── api.types.ts
│       └── app.types.ts
├── assets/                  # Images, fonts, etc.
├── app.json                # Config Expo
├── App.tsx                 # Point d'entrée
└── package.json
```

## 🎨 Design adaptatif Mobile vs Desktop

### Mobile Layout
```tsx
// Navigation: Bottom Tabs
<Tab.Navigator>
  <Tab.Screen name="Dashboard" />
  <Tab.Screen name="Missions" />
  <Tab.Screen name="Rewards" />
  <Tab.Screen name="Profile" />
</Tab.Navigator>

// Layout: Single column, vertical scroll
<ScrollView>
  <Header />
  <Content />
</ScrollView>
```

### Desktop Layout
```tsx
// Navigation: Sidebar
<View style={{ flexDirection: 'row' }}>
  <Sidebar width={250} />
  <MainContent flex={1} />
</View>

// Layout: Multi-column, responsive grid
<View style={{ flexDirection: 'row' }}>
  <LeftColumn flex={2} />
  <RightColumn flex={1} />
</View>
```

## 📱 Écrans principaux

### Authentification
- **Welcome** - Écran d'accueil
- **Login** - Connexion parent/enfant
- **Register** - Inscription
- **PIN Entry** - Saisie PIN parental

### Parent Dashboard
- **Overview** - Vue d'ensemble famille
- **Children Management** - Gestion enfants
- **Mission Creation** - Création missions
- **Validations** - Validations en attente
- **Statistics** - Statistiques détaillées
- **Settings** - Paramètres

### Child Dashboard
- **Home** - Dashboard enfant
- **My Missions** - Missions assignées
- **Rewards Shop** - Boutique récompenses
- **My Pet** - Compagnon virtuel
- **Tournaments** - Tournois actifs
- **Profile** - Profil et badges

### Gamification
- **Tournament Hub** - Centre des tournois
- **Guild Hall** - Espace guildes
- **Daily Wheel** - Roue quotidienne
- **Skill Tree** - Arbre de compétences
- **Leaderboard** - Classements

## 🔌 Intégration API

### Configuration API Client
```typescript
// src/services/api/client.ts
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Refresh Token Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      // Refresh logic
    }
    return Promise.reject(error);
  }
);
```

### Services API
```typescript
// src/services/modules/childrenService.ts
export const childrenService = {
  getAll: () => apiClient.get('/children'),
  getById: (id: number) => apiClient.get(`/children/${id}`),
  create: (data: CreateChildDto) => apiClient.post('/children', data),
  update: (id: number, data: UpdateChildDto) => apiClient.put(`/children/${id}`, data),
  delete: (id: number) => apiClient.delete(`/children/${id}`),
};
```

## 🎯 Responsive Design

### Breakpoints
```typescript
const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};
```

### Hook useResponsive
```typescript
export const useResponsive = () => {
  const { width } = useWindowDimensions();
  
  return {
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    width,
  };
};
```

### Conditional Rendering
```tsx
const Dashboard = () => {
  const { isMobile, isDesktop } = useResponsive();
  
  if (isDesktop) {
    return <DesktopDashboard />;
  }
  
  return <MobileDashboard />;
};
```

## 🎮 Features spécifiques

### Mobile
- Swipe gestures
- Pull to refresh
- Bottom sheet modals
- Touch feedback
- Haptic feedback

### Desktop
- Hover states
- Right-click menus
- Keyboard shortcuts
- Multi-window support
- Drag and drop

## 🔐 Sécurité Frontend

### Stockage sécurisé
```typescript
// Tokens JWT
await SecureStore.setItemAsync('jwt_token', token);
await SecureStore.setItemAsync('refresh_token', refreshToken);

// PIN parental
await SecureStore.setItemAsync('parent_pin', hashedPin);
```

### Protection des routes
```tsx
const ProtectedRoute = ({ children, requirePin = false }) => {
  const { isAuthenticated, isPinVerified } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requirePin && !isPinVerified) {
    return <PinEntryModal />;
  }
  
  return children;
};
```

## 📦 Build et déploiement

### Development
```bash
# Démarrer en mode dev
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Web
npx expo start --web
```

### Production
```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build Web
npx expo export:web
```

## 🧪 Tests

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Detox pour mobile
detox test

# Playwright pour web
npx playwright test
```

## 📊 Performance

### Optimisations
- Lazy loading des écrans
- Image caching
- API response caching
- Virtualized lists
- Memoization des composants

### Monitoring
- Sentry pour les erreurs
- Analytics avec Amplitude/Mixpanel
- Performance monitoring

## 🎨 Thème et personnalisation

### Système de thème
```typescript
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16 },
  },
};
```

### Mode sombre
```typescript
const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    text: '#FFFFFF',
  },
};
```

## 📝 Notes importantes

1. **Platform-specific code** : Utiliser `.ios.tsx`, `.android.tsx`, `.web.tsx`
2. **Responsive first** : Designer d'abord pour mobile, puis adapter
3. **Performance** : Optimiser les listes longues avec FlatList/VirtualizedList
4. **Offline support** : Implémenter un cache local avec Redux Persist
5. **Accessibility** : Support des lecteurs d'écran et navigation clavier