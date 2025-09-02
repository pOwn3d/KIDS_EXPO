import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '../../types/app/navigation';
import { usePlatform } from '../../hooks/usePlatform';

const TournamentsListScreen = () => null;
const Stack = createNativeStackNavigator<TournamentsStackParamList>();

const TournamentsStackNavigator: React.FC = () => {
  const platform = usePlatform();
  
  return (
    <Stack.Navigator 
      initialRouteName="TournamentsList"
      screenOptions={{ headerShown: platform.isDesktop ? false : true }}
    >
      <Stack.Screen name="TournamentsList" component={TournamentsListScreen} options={{ title: 'Tournaments' }} />
    </Stack.Navigator>
  );
};

export default TournamentsStackNavigator;