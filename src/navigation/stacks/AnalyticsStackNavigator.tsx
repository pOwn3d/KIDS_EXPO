import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnalyticsStackParamList } from '../../types/app/navigation';

const AnalyticsOverviewScreen = () => null;
const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

const AnalyticsStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="AnalyticsOverview">
    <Stack.Screen name="AnalyticsOverview" component={AnalyticsOverviewScreen} options={{ title: 'Analytics' }} />
  </Stack.Navigator>
);

export default AnalyticsStackNavigator;