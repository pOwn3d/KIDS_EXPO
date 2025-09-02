import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BadgesScreen from '../../screens/badges/BadgesScreen';
import { useTheme } from '../../hooks/useSimpleTheme';

const Stack = createNativeStackNavigator();

export default function BadgesStackNavigator() {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="BadgesList" 
        component={BadgesScreen}
        options={{ 
          title: 'Badges',
          headerShown: false 
        }}
      />
    </Stack.Navigator>
  );
}