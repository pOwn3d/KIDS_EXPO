import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import { persistor, RootState } from '../../store/store';

// Import stack navigators
import DashboardStackNavigator from '../stacks/DashboardStackNavigator';
import MissionsStackNavigator from '../stacks/MissionsStackNavigator';
import RewardsStackNavigator from '../stacks/RewardsStackNavigator';
import ProfileStackNavigator from '../stacks/ProfileStackNavigator';
import SettingsStackNavigator from '../stacks/SettingsStackNavigator';
import LeaderboardStackNavigator from '../stacks/LeaderboardStackNavigator';
import TournamentsStackNavigator from '../stacks/TournamentsStackNavigator';
import GuildsStackNavigator from '../stacks/GuildsStackNavigator';
import ActivitiesStackNavigator from '../stacks/ActivitiesStackNavigator';
import BadgesStackNavigator from '../stacks/BadgesStackNavigator';

// Types
import { MainDrawerParamList } from '../../types/app/navigation';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Custom Sidebar Component
const CustomSidebar: React.FC<any> = ({ navigation, state }) => {
  const activeRoute = state.routes[state.index].name;
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const handleLogout = async () => {
    console.log('handleLogout called');
    
    // Sur web, utiliser window.confirm au lieu d'Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) return;
    }
    
    try {
      console.log('Starting logout from Desktop Navigator...');
      
      // 1. Clear auth service storage
      await authService.logout();
      console.log('Auth service logout complete');
      
      // 2. Dispatch logout to Redux
      dispatch(logout());
      console.log('Redux logout dispatched');
      
      // 3. Purge persisted state to ensure clean logout
      await persistor.purge();
      console.log('Persisted state purged');
      
      // 4. Force reload to ensure clean state
      console.log('Reloading page...');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server fails
      dispatch(logout());
      await persistor.purge();
      window.location.href = '/';
    }
  };
  
  const menuItems = [
    { name: 'Dashboard', label: 'Tableau de bord', icon: 'grid-outline' },
    { name: 'Missions', label: 'Missions', icon: 'list-outline' },
    { name: 'Rewards', label: 'Récompenses', icon: 'gift-outline' },
    { name: 'Activities', label: 'Activités', icon: 'analytics-outline' },
    { name: 'Badges', label: 'Badges', icon: 'ribbon-outline' },
    { name: 'Leaderboard', label: 'Classement', icon: 'trophy-outline' },
    { name: 'Tournaments', label: 'Tournois', icon: 'medal-outline' },
    { name: 'Guilds', label: 'Guildes', icon: 'people-outline' },
    { name: 'Profile', label: 'Profil', icon: 'person-outline' },
    { name: 'Settings', label: 'Paramètres', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={styles.sidebar}>
      {/* Logo/Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderContent}>
          <View style={styles.sidebarLeft}>
            <View style={styles.titleContainer}>
              <View style={styles.logo}>
                <Ionicons name="star" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.appName}>Kids Points</Text>
                <Text style={styles.userEmail}>{user?.email || 'parent@famille.com'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive
              ]}
              onPress={() => navigation.navigate(item.name as any)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={20} 
                color={isActive ? '#4A90E2' : '#B0B0C0'} 
              />
              <Text style={[
                styles.menuLabel,
                isActive && styles.menuLabelActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Bottom Section */}
      <View style={styles.sidebarBottom}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            console.log('Logout button clicked!');
            handleLogout();
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * Desktop navigator with sidebar
 */
const SimpleDesktopNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'permanent',
        drawerStyle: {
          width: 240,
          backgroundColor: '#1E1E2E',
        },
        overlayColor: 'transparent',
        sceneContainerStyle: {
          backgroundColor: '#F8FAFC',
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Drawer.Screen name="Missions" component={MissionsStackNavigator} />
      <Drawer.Screen name="Rewards" component={RewardsStackNavigator} />
      <Drawer.Screen name="Activities" component={ActivitiesStackNavigator} />
      <Drawer.Screen name="Badges" component={BadgesStackNavigator} />
      <Drawer.Screen name="Leaderboard" component={LeaderboardStackNavigator} />
      <Drawer.Screen name="Tournaments" component={TournamentsStackNavigator} />
      <Drawer.Screen name="Guilds" component={GuildsStackNavigator} />
      <Drawer.Screen name="Profile" component={ProfileStackNavigator} />
      <Drawer.Screen name="Settings" component={SettingsStackNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  sidebarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  sidebarLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    alignSelf: 'center',
  },
  headerTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 0,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#2A2A3E',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#B0B0C0',
  },
  menuLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  sidebarBottom: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 12,
    color: '#B0B0C0',
    fontSize: 14,
  },
});

export default SimpleDesktopNavigator;