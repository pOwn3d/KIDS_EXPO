import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ValidationCenterScreen from '../../screens/validations/ValidationCenterScreen';
import { useTheme } from '../../hooks/useSimpleTheme';

export type ValidationsStackParamList = {
  ValidationCenter: undefined;
  ValidationDetail: { 
    validationId: string;
    type: 'mission' | 'reward';
  };
};

const Stack = createNativeStackNavigator<ValidationsStackParamList>();

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
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ValidationCenter"
        component={ValidationCenterScreen}
        options={{
          title: 'Centre de Validation',
          headerLargeTitle: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default ValidationsStackNavigator;