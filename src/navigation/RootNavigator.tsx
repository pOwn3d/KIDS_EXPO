import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

// Navigation components
import MobileNavigator from './mobile/MobileNavigator';
import DesktopNavigator from './desktop/DesktopNavigator';
import AuthNavigator from './AuthNavigator';

// Types
import { RootStackParamList } from '../types/app/navigation';

// Hooks and utilities
import { useTheme } from '../hooks/useSimpleTheme';
import { usePlatform } from '../hooks/usePlatform';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectCurrentUser 
} from '../store/store';
import { validateSessionAsync, clearLoading } from '../store/slices/authSlice';

// Screens and modals
import { ModalScreen } from '../screens/common/ModalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator that handles authentication state and platform-specific navigation
 */
const RootNavigator: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = false;
  const platform = usePlatform();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const currentUser = useSelector(selectCurrentUser);
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize app - skip session validation for now
  useEffect(() => {
    // Small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      setIsInitializing(false);
      
      // Clear any stuck loading state
      if (authLoading) {
        dispatch(clearLoading() as any);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Debug logging removed
  
  // React to authentication changes
  useEffect(() => {
    if (!isAuthenticated && !authLoading && !isInitializing) {
      // User logged out, should show Auth screen
    }
  }, [isAuthenticated, authLoading, isInitializing]);

  // Create navigation theme based on current theme
  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  // Show loading screen during initialization
  if (isInitializing || authLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </View>
    );
  }

  // Determine which main navigator to use based on platform
  const MainNavigator = platform.shouldUseDesktopNavigation 
    ? DesktopNavigator 
    : MobileNavigator;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          // Authentication flow
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop',
              gestureEnabled: false,
            }}
          />
        ) : (
          // Main app flow
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
        )}

        {/* Global Modal Screen */}
        <Stack.Screen
          name="Modal"
          component={ModalScreen}
          options={{
            presentation: platform.isDesktop ? 'modal' : 'fullScreenModal',
            animation: platform.isDesktop ? 'fade' : 'slide_from_bottom',
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
      </Stack.Navigator>

      {/* Status Bar */}
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor={theme.colors.background}
        translucent={false}
      />
    </NavigationContainer>
  );
};

export default RootNavigator;