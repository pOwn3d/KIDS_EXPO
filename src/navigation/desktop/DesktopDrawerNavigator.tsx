import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import stack navigators
import DashboardStackNavigator from '../stacks/DashboardStackNavigator';
import ChildrenStackNavigator from '../stacks/ChildrenStackNavigator';
import MissionsStackNavigator from '../stacks/MissionsStackNavigator';
import RewardsStackNavigator from '../stacks/RewardsStackNavigator';
import AnalyticsStackNavigator from '../stacks/AnalyticsStackNavigator';
import TournamentsStackNavigator from '../stacks/TournamentsStackNavigator';
import GuildsStackNavigator from '../stacks/GuildsStackNavigator';
import ProfileStackNavigator from '../stacks/ProfileStackNavigator';
import SparkyStackNavigator from '../stacks/SparkyStackNavigator';
import SettingsStackNavigator from '../stacks/SettingsStackNavigator';

// Types and hooks
import { MainDrawerParamList } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentUser, 
  selectUserRole,
  selectUnreadNotifications,
  selectNotificationCount,
} from '../../store/store';
import { logoutAsync } from '../../store/slices/authSlice';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Custom Drawer Content for Desktop
const CustomDrawerContent: React.FC<any> = (props) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const notificationCount = useSelector(selectNotificationCount);

  const handleLogout = () => {
    dispatch(logoutAsync() as any);
  };

  const menuItems = [
    {
      key: 'Dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      route: 'Dashboard',
      badge: notificationCount > 0 ? notificationCount : undefined,
    },
    ...(userRole === 'PARENT' ? [
      {
        key: 'Children',
        label: 'Children',
        icon: 'people-outline',
        route: 'Children',
      },
    ] : []),
    {
      key: 'Missions',
      label: userRole === 'PARENT' ? 'Tasks Management' : 'My Missions',
      icon: 'list-outline',
      route: 'Missions',
    },
    {
      key: 'Rewards',
      label: userRole === 'PARENT' ? 'Rewards Management' : 'Reward Shop',
      icon: 'gift-outline',
      route: 'Rewards',
    },
    ...(userRole === 'PARENT' ? [
      {
        key: 'Analytics',
        label: 'Analytics & Reports',
        icon: 'bar-chart-outline',
        route: 'Analytics',
      },
    ] : []),
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: 'Tournaments',
      label: 'Tournaments',
      icon: 'trophy-outline',
      route: 'Tournaments',
    },
    {
      key: 'Guilds',
      label: 'Guilds & Teams',
      icon: 'shield-outline',
      route: 'Guilds',
    },
    {
      key: 'divider2',
      type: 'divider',
    },
    {
      key: 'Profile',
      label: userRole === 'PARENT' ? 'Family Profile' : 'My Profile',
      icon: 'person-outline',
      route: 'Profile',
    },
    {
      key: 'Sparky',
      label: 'Sparky AI Assistant',
      icon: 'chatbubble-ellipses-outline',
      route: 'Sparky',
    },
    {
      key: 'Settings',
      label: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.sidebarBackground || theme.colors.backgroundSecondary,
    },
    header: {
      paddingTop: insets.top + 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.sidebarBackground || theme.colors.backgroundSecondary,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    avatarText: {
      color: theme.colors.textInverse,
      fontSize: 18,
      fontWeight: 'bold',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 2,
    },
    userRole: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginHorizontal: 8,
      marginVertical: 2,
      borderRadius: 8,
    },
    menuItemActive: {
      backgroundColor: theme.colors.sidebarActiveBackground || theme.colors.primaryLight,
    },
    menuItemIcon: {
      marginRight: 16,
      width: 24,
      alignItems: 'center',
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    menuItemTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 8,
      marginHorizontal: 20,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    logoutText: {
      marginLeft: 12,
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: '500',
    },
  });

  const getUserInitials = () => {
    if (!currentUser) return '?';
    const initials = `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`;
    return initials.toUpperCase() || currentUser.email[0].toUpperCase();
  };

  const renderMenuItem = (item: any, index: number) => {
    if (item.type === 'divider') {
      return <View key={item.key} style={styles.divider} />;
    }

    const isActive = props.state.routeNames[props.state.index] === item.route;

    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={() => props.navigation.navigate(item.route)}
        accessibilityLabel={item.label}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.menuItemIcon}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isActive 
              ? theme.colors.primary 
              : theme.colors.textSecondary
            }
          />
        </View>
        <Text style={[
          styles.menuItemText,
          isActive && styles.menuItemTextActive,
        ]}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.badge > 99 ? '99+' : item.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
            </Text>
            <Text style={styles.userRole}>
              {userRole === 'PARENT' ? 'Parent Account' : 'Child Account'}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Menu */}
      <DrawerContentScrollView
        {...props}
        style={styles.content}
        contentContainerStyle={{ paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map(renderMenuItem)}
      </DrawerContentScrollView>

      {/* Footer with Logout */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Desktop drawer navigator with sidebar
 * Provides comprehensive navigation for larger screens
 */
const DesktopDrawerNavigator: React.FC = () => {
  const theme = useTheme();
  const userRole = useSelector(selectUserRole);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // Drawer configuration
        drawerType: 'permanent', // Always visible on desktop
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.sidebarBackground || theme.colors.backgroundSecondary,
          borderRightWidth: 1,
          borderRightColor: theme.colors.border,
        },
        drawerPosition: 'left',
        
        // Header configuration
        headerShown: false, // Each stack manages its own headers
        
        // Overlap behavior
        overlayColor: 'transparent',
        
        // Gestures (disabled for desktop)
        swipeEnabled: false,
        
        // Animation
        drawerHideStatusBarOnOpen: false,
        drawerStatusBarAnimation: 'none',
      }}
      initialRouteName="Dashboard"
    >
      {/* Dashboard */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{ title: 'Dashboard' }}
      />

      {/* Children Management (Parents only) */}
      {userRole === 'PARENT' && (
        <Drawer.Screen
          name="Children"
          component={ChildrenStackNavigator}
          options={{ title: 'Children Management' }}
        />
      )}

      {/* Missions */}
      <Drawer.Screen
        name="Missions"
        component={MissionsStackNavigator}
        options={{ 
          title: userRole === 'PARENT' ? 'Tasks Management' : 'My Missions' 
        }}
      />

      {/* Rewards */}
      <Drawer.Screen
        name="Rewards"
        component={RewardsStackNavigator}
        options={{ 
          title: userRole === 'PARENT' ? 'Rewards Management' : 'Reward Shop' 
        }}
      />

      {/* Analytics (Parents only) */}
      {userRole === 'PARENT' && (
        <Drawer.Screen
          name="Analytics"
          component={AnalyticsStackNavigator}
          options={{ title: 'Analytics & Reports' }}
        />
      )}

      {/* Tournaments */}
      <Drawer.Screen
        name="Tournaments"
        component={TournamentsStackNavigator}
        options={{ title: 'Tournaments' }}
      />

      {/* Guilds */}
      <Drawer.Screen
        name="Guilds"
        component={GuildsStackNavigator}
        options={{ title: 'Guilds & Teams' }}
      />

      {/* Profile */}
      <Drawer.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ 
          title: userRole === 'PARENT' ? 'Family Profile' : 'My Profile' 
        }}
      />

      {/* Sparky AI */}
      <Drawer.Screen
        name="Sparky"
        component={SparkyStackNavigator}
        options={{ title: 'Sparky AI Assistant' }}
      />

      {/* Settings */}
      <Drawer.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
};

export default DesktopDrawerNavigator;