import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MissionsStackParamList } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';

// Import screens
import MissionsHomeScreen from '../../screens/missions/MissionsHomeScreen';
import CreateMissionScreen from '../../screens/missions/CreateMissionScreen';
import MissionDetailScreen from '../../screens/missions/MissionDetailScreen';

const Stack = createNativeStackNavigator<MissionsStackParamList>();

const MissionsStackNavigator: React.FC = () => {
  const theme = useTheme();
  const platform = usePlatform();

  return (
    <Stack.Navigator 
      initialRouteName="MissionsList"
      screenOptions={{
        headerShown: false, // Nos écrans ont leur propre header
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="MissionsList" 
        component={MissionsHomeScreen} 
        options={{ title: 'Missions' }} 
      />
      <Stack.Screen 
        name="MissionDetails" 
        component={MissionDetailScreen} 
        options={{ title: 'Détails de la mission' }} 
      />
      <Stack.Screen 
        name="CreateMission" 
        component={CreateMissionScreen} 
        options={{ title: 'Nouvelle mission' }} 
      />
    </Stack.Navigator>
  );
};

export default MissionsStackNavigator;