import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuildsStackParamList } from '../../types/app/navigation';
import { usePlatform } from '../../hooks/usePlatform';

const GuildsListScreen = () => null;
const Stack = createNativeStackNavigator<GuildsStackParamList>();

const GuildsStackNavigator: React.FC = () => {
  const platform = usePlatform();
  
  return (
    <Stack.Navigator 
      initialRouteName="GuildsList"
      screenOptions={{ headerShown: platform.isDesktop ? false : true }}
    >
      <Stack.Screen name="GuildsList" component={GuildsListScreen} options={{ title: 'Guilds' }} />
    </Stack.Navigator>
  );
};

export default GuildsStackNavigator;