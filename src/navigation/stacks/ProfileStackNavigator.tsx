import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/app/navigation';
import ProfileHomeScreen from '../../screens/profile/ProfileHomeScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="ProfileHome">
    <Stack.Screen 
      name="ProfileHome" 
      component={ProfileHomeScreen} 
      options={{ 
        title: 'Mon Profil',
        headerShown: true 
      }} 
    />
  </Stack.Navigator>
);

export default ProfileStackNavigator;