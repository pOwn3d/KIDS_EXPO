import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChildrenStackParamList } from '../../types/app/navigation';
import ChildProfileScreen from '../../screens/child/ChildProfileScreen';

const ChildrenListScreen = () => null;
const Stack = createNativeStackNavigator<ChildrenStackParamList>();

const ChildrenStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="ChildrenList">
    <Stack.Screen name="ChildrenList" component={ChildrenListScreen} options={{ title: 'Children' }} />
    <Stack.Screen 
      name="ChildProfile" 
      component={ChildProfileScreen} 
      options={{ 
        title: 'Profil Enfant',
        headerShown: true 
      }} 
    />
  </Stack.Navigator>
);

export default ChildrenStackNavigator;