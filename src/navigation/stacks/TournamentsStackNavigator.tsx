import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '../../types/app/navigation';

const TournamentsListScreen = () => null;
const Stack = createNativeStackNavigator<TournamentsStackParamList>();

const TournamentsStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="TournamentsList">
    <Stack.Screen name="TournamentsList" component={TournamentsListScreen} options={{ title: 'Tournaments' }} />
  </Stack.Navigator>
);

export default TournamentsStackNavigator;