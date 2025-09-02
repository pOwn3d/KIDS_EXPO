import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/app/navigation';
import SettingsScreen from '../../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator: React.FC = () => (
  <Stack.Navigator 
    initialRouteName="SettingsHome"
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen 
      name="SettingsHome" 
      component={SettingsScreen} 
      options={{ title: 'Paramètres' }} 
    />
  </Stack.Navigator>
);

export default SettingsStackNavigator;