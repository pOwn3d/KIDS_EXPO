import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/app/navigation';

const SettingsHomeScreen = () => null;
const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="SettingsHome">
    <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} options={{ title: 'Settings' }} />
  </Stack.Navigator>
);

export default SettingsStackNavigator;