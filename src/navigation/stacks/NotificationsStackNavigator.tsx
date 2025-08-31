import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import { useTheme } from '../../hooks/useSimpleTheme';

export type NotificationsStackParamList = {
  NotificationsList: undefined;
  NotificationDetail: { notificationId: string };
};

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

const NotificationsStackNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground || theme.colors.card,
        },
        headerTintColor: theme.colors.headerText || theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamilies?.bold || 'System',
          fontSize: 18,
        },
        headerBackTitle: 'Retour',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerLargeTitle: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default NotificationsStackNavigator;