import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChildrenStackParamList } from '../../types/app/navigation';
import ChildrenListScreen from '../../screens/children/ChildrenListScreen';
import ChildProfileScreen from '../../screens/children/ChildProfileScreen';
import AddChildScreen from '../../screens/children/AddChildScreen';
import { usePlatform } from '../../hooks/usePlatform';

const Stack = createNativeStackNavigator<ChildrenStackParamList>();

const ChildrenStackNavigator: React.FC = () => {
  const platform = usePlatform();
  
  return (
    <Stack.Navigator 
      initialRouteName="ChildrenList"
      screenOptions={{
        headerShown: platform.isDesktop ? false : true,
      }}
    >
      <Stack.Screen 
        name="ChildrenList" 
        component={ChildrenListScreen} 
        options={{ title: 'Enfants' }} 
      />
      <Stack.Screen 
        name="ChildProfile" 
        component={ChildProfileScreen} 
        options={{ 
          title: 'Profil Enfant',
        }} 
      />
      <Stack.Screen 
        name="AddChild" 
        component={AddChildScreen} 
        options={{ 
          title: 'Ajouter un enfant',
        }} 
      />
    </Stack.Navigator>
  );
};

export default ChildrenStackNavigator;