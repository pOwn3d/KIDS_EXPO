import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { useTheme, ThemeProvider } from './src/hooks/useSimpleTheme';
import { logout } from './src/store/slices/authSlice';
import { appEvents } from './src/services/events.service';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: componentWillReceiveProps',
  'VirtualizedLists should never be nested',
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const isDarkMode = false; // Simple, no dark mode for now
  const dispatch = useDispatch();

  useEffect(() => {
    // Hide splash screen after app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    setTimeout(hideSplash, 1000);
    
    // Listener pour la déconnexion automatique en cas d'échec d'authentification
    const unsubscribe = appEvents.onAuthLogout(() => {
      dispatch(logout());
      Toast.show({
        type: 'error',
        text1: 'Session expirée',
        text2: 'Veuillez vous reconnecter',
        position: 'top',
      });
    });
    
    return unsubscribe;
  }, [dispatch]);

  return (
    <>
      <RootNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}