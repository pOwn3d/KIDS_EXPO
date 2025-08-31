import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useSimpleTheme';
import LeaderboardScreen from '../../screens/leaderboard/LeaderboardScreen';

export type LeaderboardStackParamList = {
  LeaderboardMain: undefined;
  LeaderboardDetail: { childId: string };
};

const Stack = createNativeStackNavigator<LeaderboardStackParamList>();

const LeaderboardStackNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator 
      initialRouteName="LeaderboardMain"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="LeaderboardMain" 
        component={LeaderboardScreen} 
        options={{ title: 'Classement' }} 
      />
    </Stack.Navigator>
  );
};

export default LeaderboardStackNavigator;