import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RewardsStackParamList } from '../../types/app/navigation';
import RewardsListScreen from '../../screens/rewards/RewardsListScreen';

const Stack = createNativeStackNavigator<RewardsStackParamList>();

const RewardsStackNavigator: React.FC = () => (
  <Stack.Navigator 
    initialRouteName="RewardsShop"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen 
      name="RewardsShop" 
      component={RewardsListScreen} 
    />
  </Stack.Navigator>
);

export default RewardsStackNavigator;