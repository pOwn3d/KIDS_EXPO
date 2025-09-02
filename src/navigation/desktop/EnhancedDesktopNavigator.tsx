import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import { persistor, selectCurrentUser } from '../../store/store';
import { LinearGradient } from 'expo-linear-gradient';

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

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Enhanced Sidebar Component with better design
const EnhancedSidebar: React.FC<any> = ({ navigation, state }) => {
  const activeRoute = state.routes[state.index].name;
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [isExpanded, setIsExpanded] = useState(isDesktop);
  
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) return;
    }
    
    try {
      await authService.logout();
      dispatch(logout());
      await persistor.purge();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      await persistor.purge();
      window.location.href = '/';
    }
  };
  
  const menuItems = [
    { name: 'Dashboard', label: 'Tableau de bord', icon: 'grid', color: '#0EA5E9' },
    { name: 'Missions', label: 'Missions', icon: 'checkmark-circle', color: '#10B981' },
    { name: 'Rewards', label: 'Récompenses', icon: 'gift', color: '#F59E0B' },
    { name: 'Activities', label: 'Activités', icon: 'analytics', color: '#A855F7' },
    { name: 'Badges', label: 'Badges', icon: 'ribbon', color: '#EC4899' },
    { name: 'Leaderboard', label: 'Classement', icon: 'trophy', color: '#F97316' },
    { name: 'Tournaments', label: 'Tournois', icon: 'medal', color: '#6366F1' },
    { name: 'Guilds', label: 'Guildes', icon: 'people', color: '#8B5CF6' },
  ];

  const bottomMenuItems = [
    { name: 'Profile', label: 'Profil', icon: 'person-circle', color: '#64748B' },
    { name: 'Settings', label: 'Paramètres', icon: 'settings', color: '#64748B' },
  ];

  const sidebarWidth = isExpanded ? 280 : 80;

  return (
    <SafeAreaView style={[styles.sidebar, { width: sidebarWidth }]}>
      {/* Header with Logo and User Info */}
      <LinearGradient
        colors={['#A855F7', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sidebarHeader}
      >
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.logo}>
            <Ionicons name="star" size={28} color="#FFFFFF" />
          </View>
          {isExpanded && (
            <View style={styles.headerText}>
              <Text style={styles.appName}>Kids Points</Text>
              <Text style={styles.userEmail}>{currentUser?.email}</Text>
            </View>
          )}
        </TouchableOpacity>
        {isExpanded && (
          <TouchableOpacity onPress={() => setIsExpanded(false)}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>
      
      {/* Main Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          {isExpanded && <Text style={styles.sectionTitle}>PRINCIPAL</Text>}
          {menuItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  !isExpanded && styles.menuItemCollapsed
                ]}
                onPress={() => navigation.navigate(item.name as any)}
              >
                <View style={[
                  styles.iconContainer,
                  isActive && { backgroundColor: item.color + '20' }
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={isActive ? item.color : '#64748B'} 
                  />
                </View>
                {isExpanded && (
                  <>
                    <Text style={[
                      styles.menuLabel,
                      isActive && [styles.menuLabelActive, { color: item.color }]
                    ]}>
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />
                    )}
                  </>
                )}
                {!isExpanded && isActive && (
                  <View style={[styles.activeIndicatorSmall, { backgroundColor: item.color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Menu Items */}
        <View style={[styles.menuSection, styles.bottomSection]}>
          {isExpanded && <Text style={styles.sectionTitle}>COMPTE</Text>}
          {bottomMenuItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  !isExpanded && styles.menuItemCollapsed
                ]}
                onPress={() => navigation.navigate(item.name as any)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={isActive ? '#0EA5E9' : '#64748B'} 
                  />
                </View>
                {isExpanded && (
                  <Text style={[
                    styles.menuLabel,
                    isActive && styles.menuLabelActive
                  ]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Logout Button */}
      <View style={styles.sidebarBottom}>
        <TouchableOpacity 
          style={[styles.logoutButton, !isExpanded && styles.logoutButtonCollapsed]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          {isExpanded && <Text style={styles.logoutText}>Déconnexion</Text>}
        </TouchableOpacity>
      </View>

      {/* Expand Button for Collapsed State */}
      {!isExpanded && (
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

/**
 * Enhanced Desktop navigator with modern sidebar
 */
const EnhancedDesktopNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Drawer.Navigator
        drawerContent={(props) => <EnhancedSidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent',
          drawerStyle: {
            width: isDesktop ? 280 : 80,
            backgroundColor: 'transparent',
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    marginBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuSection: {
    marginBottom: 24,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#F0F9FF',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  menuLabelActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  activeIndicatorSmall: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  sidebarBottom: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  logoutButtonCollapsed: {
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 12,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  expandButton: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default EnhancedDesktopNavigator;