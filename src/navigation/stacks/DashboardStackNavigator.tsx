import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import dashboard screens (we'll create these)
import DashboardHomeScreen from '../../screens/dashboard/DashboardHomeScreen';
import QuickActionsScreen from '../../screens/dashboard/QuickActionsScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import FamilyOverviewScreen from '../../screens/dashboard/FamilyOverviewScreen';

// Types
import { DashboardStackParamList } from '../../types/app/navigation';

// Hooks
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/store';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

/**
 * Dashboard stack navigator
 * Contains all dashboard-related screens
 */
const DashboardStackNavigator: React.FC = () => {
  const theme = useTheme();
  const platform = usePlatform();
  const userRole = useSelector(selectUserRole);

  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: platform.isDesktop ? 24 : 20,
      fontFamily: theme.typography.fontFamilies.bold,
    },
    headerBackTitleVisible: false,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="DashboardHome"
      screenOptions={commonScreenOptions}
    >
      {/* Main Dashboard */}
      <Stack.Screen
        name="DashboardHome"
        component={DashboardHomeScreen}
        options={{
          title: 'Tableau de bord',
          headerLargeTitle: platform.isDesktop,
          headerSearchBarOptions: platform.isDesktop ? {
            placeholder: 'Search...',
            hideWhenScrolling: false,
          } : undefined,
        }}
      />

      {/* Quick Actions */}
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsScreen}
        options={{
          title: 'Quick Actions',
          presentation: platform.isDesktop ? 'modal' : 'card',
          animation: platform.isDesktop ? 'fade' : 'slide_from_right',
        }}
      />

      {/* Notifications */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerRight: platform.isDesktop ? () => (
            // Mark all as read button for desktop
            // TODO: Implement header button component
            null
          ) : undefined,
        }}
      />

      {/* Family Overview (Parents only) */}
      {userRole === 'PARENT' && (
        <Stack.Screen
          name="FamilyOverview"
          component={FamilyOverviewScreen}
          options={{
            title: 'Family Overview',
            headerLargeTitle: platform.isDesktop,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator;