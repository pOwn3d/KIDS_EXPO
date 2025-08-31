import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens (we'll create these)
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PinSetupScreen from '../screens/auth/PinSetupScreen';
import ChildSelectionScreen from '../screens/auth/ChildSelectionScreen';

// Types
import { AuthStackParamList } from '../types/app/navigation';

// Hooks
import { useTheme } from '../hooks/useSimpleTheme';
import { usePlatform } from '../hooks/usePlatform';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication flow navigator
 * Handles all authentication-related screens
 */
const AuthNavigator: React.FC = () => {
  const theme = useTheme();
  const platform = usePlatform();

  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: platform.isDesktop ? 20 : 18,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    animation: platform.isDesktop ? 'fade' as const : 'slide_from_right' as const,
    gestureEnabled: true,
  };

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={commonScreenOptions}
    >
      {/* Welcome Screen */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Don't allow back gesture on welcome
        }}
      />

      {/* Login Screen */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={({ route }) => ({
          title: route.params?.userType === 'child' ? 'Child Login' : 'Login',
          headerShown: !platform.isMobile, // Hide header on mobile for cleaner look
        })}
      />

      {/* Register Screen */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: !platform.isMobile,
        }}
      />

      {/* Forgot Password Screen */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true, // Always show for context
        }}
      />

      {/* PIN Setup Screen */}
      <Stack.Screen
        name="PinSetup"
        component={PinSetupScreen}
        options={{
          title: 'Setup Security PIN',
          headerShown: true,
          gestureEnabled: false, // Don't allow back during PIN setup
          headerBackVisible: false,
        }}
      />

      {/* Child Selection Screen */}
      <Stack.Screen
        name="ChildSelection"
        component={ChildSelectionScreen}
        options={{
          title: 'Select Child',
          headerShown: true,
          headerBackVisible: false, // User must select a child
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;