import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MissionValidationScreen from '../../screens/missions/MissionValidationScreen';
import RewardClaimsScreen from '../../screens/rewards/RewardClaimsScreen';
import { useTheme } from '../../hooks/useSimpleTheme';

export type ValidationsStackParamList = {
  ValidationCenter: undefined;
  MissionValidation: undefined;
  RewardClaims: undefined;
};

const Stack = createNativeStackNavigator<ValidationsStackParamList>();

// Simple validation center that shows both validations
const ValidationCenter: React.FC = () => {
  return (
    <MissionValidationScreen />
  );
};

const ValidationsStackNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground || theme.colors.card,
        },
        headerTintColor: theme.colors.headerText || theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamilies?.bold || 'System',
          fontSize: 18,
        },
        headerBackTitle: 'Retour',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="ValidationCenter" 
        component={ValidationCenter}
        options={{ 
          title: 'Centre de validation',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="MissionValidation" 
        component={MissionValidationScreen}
        options={{ 
          title: 'Validation des missions' 
        }} 
      />
      <Stack.Screen 
        name="RewardClaims" 
        component={RewardClaimsScreen}
        options={{ 
          title: 'Validation des récompenses' 
        }} 
      />
    </Stack.Navigator>
  );
};

export default ValidationsStackNavigator;