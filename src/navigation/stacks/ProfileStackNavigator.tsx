import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/app/navigation';
import ProfileHomeScreen from '../../screens/profile/ProfileHomeScreen';
import { usePlatform } from '../../hooks/usePlatform';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  const platform = usePlatform();
  
  return (
    <Stack.Navigator 
      initialRouteName="ProfileHome"
      screenOptions={{ headerShown: platform.isDesktop ? false : true }}
    >
      <Stack.Screen 
        name="ProfileHome" 
        component={ProfileHomeScreen} 
        options={{ title: 'Mon Profil' }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;