import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Import stack navigators
import DashboardStackNavigator from '../stacks/DashboardStackNavigator';
import MissionsStackNavigator from '../stacks/MissionsStackNavigator';
import RewardsStackNavigator from '../stacks/RewardsStackNavigator';
import ProfileStackNavigator from '../stacks/ProfileStackNavigator';
import SparkyStackNavigator from '../stacks/SparkyStackNavigator';
import NotificationsStackNavigator from '../stacks/NotificationsStackNavigator';

// Types
import { MainTabParamList } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/store';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Mobile bottom tab navigator
 * Adapts based on user role (parent vs child)
 */
const MobileTabNavigator: React.FC = () => {
  const theme = useTheme();
  const userRole = useSelector(selectUserRole);

  const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'Dashboard':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Missions':
        iconName = focused ? 'list' : 'list-outline';
        break;
      case 'Rewards':
        iconName = focused ? 'gift' : 'gift-outline';
        break;
      case 'Notifications':
        iconName = focused ? 'notifications' : 'notifications-outline';
        break;
      case 'Profile':
        iconName = focused ? 'person' : 'person-outline';
        break;
      case 'Sparky':
        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
        break;
      default:
        iconName = focused ? 'ellipse' : 'ellipse-outline';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  };

  const getTabBarLabel = (routeName: string) => {
    switch (routeName) {
      case 'Dashboard':
        return userRole === 'PARENT' ? 'Accueil' : 'Accueil';
      case 'Missions':
        return userRole === 'PARENT' ? 'Missions' : 'Missions';
      case 'Rewards':
        return userRole === 'PARENT' ? 'Récompenses' : 'Boutique';
      case 'Notifications':
        return 'Notifications';
      case 'Profile':
        return userRole === 'PARENT' ? 'Famille' : 'Profil';
      case 'Sparky':
        return 'Sparky';
      default:
        return routeName;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header
        headerShown: false, // Each stack manages its own headers
        
        // Tab Bar Styling
        tabBarActiveTintColor: theme.colors.tabBarActiveText || theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactiveText || theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground || theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.select({
            ios: 88, // Account for safe area
            android: 65,
            default: 65,
          }),
          paddingTop: Platform.select({
            ios: 10,
            android: 8,
            default: 8,
          }),
          paddingBottom: Platform.select({
            ios: 25, // Account for home indicator
            android: 8,
            default: 8,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
          marginTop: 2,
        },
        
        // Tab Bar Icon
        tabBarIcon: ({ focused, color, size }) => 
          getTabBarIcon(route.name, focused, color, size),
        
        // Tab Bar Label
        tabBarLabel: getTabBarLabel(route.name),
        
        // Accessibility
        tabBarAccessibilityLabel: `${getTabBarLabel(route.name)} Tab`,
        
        // Badge (for notifications)
        tabBarBadge: undefined, // Will be set dynamically based on state
      })}
      // Tab Bar Behavior
      backBehavior="history"
      initialRouteName="Dashboard"
      // Screen readers
      screenListeners={{
        focus: () => {
          // Analytics or other side effects when tab is focused
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarTestID: 'dashboard-tab',
        }}
      />

      {/* Missions Tab */}
      <Tab.Screen
        name="Missions"
        component={MissionsStackNavigator}
        options={{
          tabBarTestID: 'missions-tab',
        }}
      />

      {/* Rewards Tab */}
      <Tab.Screen
        name="Rewards"
        component={RewardsStackNavigator}
        options={{
          tabBarTestID: 'rewards-tab',
        }}
      />

      {/* Notifications Tab */}
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{
          tabBarTestID: 'notifications-tab',
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarTestID: 'profile-tab',
        }}
      />

      {/* Sparky Tab */}
      <Tab.Screen
        name="Sparky"
        component={SparkyStackNavigator}
        options={{
          tabBarTestID: 'sparky-tab',
          // Show badge for unread messages
          tabBarBadge: undefined, // Will be connected to selector later
        }}
      />
    </Tab.Navigator>
  );
};

export default MobileTabNavigator;