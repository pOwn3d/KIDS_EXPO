import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActivitiesScreen from '../../screens/activities/ActivitiesScreen';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';

const Stack = createNativeStackNavigator();

export default function ActivitiesStackNavigator() {
  const theme = useTheme();
  const platform = usePlatform();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: platform.isDesktop ? false : true,
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
        name="ActivitiesList" 
        component={ActivitiesScreen}
        options={{ 
          title: 'Activités'
        }}
      />
    </Stack.Navigator>
  );
}