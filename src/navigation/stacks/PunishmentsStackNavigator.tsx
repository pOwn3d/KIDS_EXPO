import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { usePlatform } from '../../hooks/usePlatform';
import PunishmentManagementScreen from '../../screens/punishments/PunishmentManagementScreen';
import PunishmentsListScreen from '../../screens/punishments/PunishmentsListScreen';

export type PunishmentsStackParamList = {
  PunishmentsList: undefined;
  PunishmentManagement: undefined;
};

const Stack = createNativeStackNavigator<PunishmentsStackParamList>();

const PunishmentsStackNavigator: React.FC = () => {
  const platform = usePlatform();
  
  return (
    <Stack.Navigator 
      initialRouteName="PunishmentsList"
      screenOptions={{
        headerShown: platform.isDesktop ? false : true,
      }}
    >
      <Stack.Screen 
        name="PunishmentsList" 
        component={PunishmentsListScreen} 
        options={{ title: 'Punitions' }} 
      />
      <Stack.Screen 
        name="PunishmentManagement" 
        component={PunishmentManagementScreen} 
        options={{ title: 'Gestion des punitions' }} 
      />
    </Stack.Navigator>
  );
};

export default PunishmentsStackNavigator;