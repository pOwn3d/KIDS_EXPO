import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RewardsStackParamList } from '../../types/app/navigation';
import RewardsListScreen from '../../screens/rewards/RewardsListScreen';
import CreateRewardScreen from '../../screens/rewards/CreateRewardScreen';
import ChildRewardClaimScreen from '../../screens/rewards/ChildRewardClaimScreen';
import RewardClaimsScreen from '../../screens/rewards/RewardClaimsScreen';

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
    <Stack.Screen 
      name="CreateReward" 
      component={CreateRewardScreen} 
      options={{ title: 'Nouvelle Récompense' }}
    />
    <Stack.Screen 
      name="ClaimReward" 
      component={ChildRewardClaimScreen} 
      options={{ title: 'Réclamer une récompense' }}
    />
    <Stack.Screen 
      name="RewardClaims" 
      component={RewardClaimsScreen} 
      options={{ title: 'Demandes de récompenses' }}
    />
  </Stack.Navigator>
);

export default RewardsStackNavigator;