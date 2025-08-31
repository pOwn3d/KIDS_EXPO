import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuildsStackParamList } from '../../types/app/navigation';

const GuildsListScreen = () => null;
const Stack = createNativeStackNavigator<GuildsStackParamList>();

const GuildsStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="GuildsList">
    <Stack.Screen name="GuildsList" component={GuildsListScreen} options={{ title: 'Guilds' }} />
  </Stack.Navigator>
);

export default GuildsStackNavigator;