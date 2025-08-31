import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SparkyStackParamList } from '../../types/app/navigation';

const SparkyChatScreen = () => null;
const Stack = createNativeStackNavigator<SparkyStackParamList>();

const SparkyStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="SparkyChat">
    <Stack.Screen name="SparkyChat" component={SparkyChatScreen} options={{ title: 'Sparky' }} />
  </Stack.Navigator>
);

export default SparkyStackNavigator;