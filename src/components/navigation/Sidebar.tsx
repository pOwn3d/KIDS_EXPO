import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks/useSimpleTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import { persistor } from '../../store/store';

interface NavItem {
  name: string;
  route?: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
  children?: NavItem[];
}

const Sidebar: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const navigation_items: NavItem[] = [
    { 
      name: 'Tableau de bord', 
      route: 'Dashboard', 
      icon: 'home',
    },
    { 
      name: 'Missions', 
      route: 'Missions', 
      icon: 'trophy', 
      badge: 3,
    },
    { 
      name: 'Récompenses', 
      route: 'Rewards', 
      icon: 'gift',
    },
    { 
      name: 'Classement', 
      route: 'Leaderboard', 
      icon: 'bar-chart',
    },
    {
      name: 'Espace Parent',
      icon: 'person',
      children: [
        { name: 'Mes Enfants', route: 'Children', icon: 'people' },
        { name: 'Tableau de bord Parent', route: 'ParentDashboard', icon: 'home' },
        { name: 'Valider Missions', route: 'ValidateMissions', icon: 'checkmark-circle', badge: 2 },
        { name: 'Administration', route: 'Admin', icon: 'shield-checkmark' },
        { name: 'Statistiques', route: 'Statistics', icon: 'pie-chart' },
        { name: 'Notifications', route: 'Notifications', icon: 'notifications' },
      ],
    },
    { 
      name: 'Paramètres', 
      route: 'Settings', 
      icon: 'settings',
    },
  ];

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const renderNavItem = (item: NavItem, isChild: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const isActive = item.route === route.name;

    if (hasChildren) {
      return (
        <View key={item.name} style={isChild ? {} : styles.menuGroup}>
          <TouchableOpacity
            onPress={() => toggleMenu(item.name)}
            style={[
              styles.navItem,
              isChild && styles.childNavItem,
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.navItemContent}>
              <Ionicons
                name={item.icon}
                size={20}
                color={theme.colors.textSecondary}
                style={styles.icon}
              />
              <Text style={[styles.navText, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={theme.colors.textLight}
                style={styles.chevron}
              />
            </View>
          </TouchableOpacity>
          
          {isExpanded && (
            <View style={styles.subMenu}>
              {item.children?.map(child => renderNavItem(child, true))}
            </View>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.name}
        onPress={() => item.route && navigation.navigate(item.route as never)}
        style={[
          styles.navItem,
          isChild && styles.childNavItem,
          isActive && styles.activeNavItem,
        ]}
        activeOpacity={0.7}
      >
        {isActive && !isChild && (
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeIndicator}
          />
        )}
        
        <View style={styles.navItemContent}>
          <Ionicons
            name={item.icon}
            size={isChild ? 18 : 20}
            color={isActive ? theme.colors.secondary : theme.colors.textSecondary}
            style={styles.icon}
          />
          <Text style={[
            styles.navText,
            isChild && styles.childNavText,
            { color: isActive ? theme.colors.secondary : theme.colors.text },
            isActive && styles.activeText,
          ]}>
            {item.name}
          </Text>
          
          {item.badge !== undefined && item.badge > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.badgeText}>
                {item.badge}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoContainer}
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.logoText, { color: theme.colors.text }]}>
          Kids Points
        </Text>
      </View>

      {/* User Stats */}
      <View style={[styles.userSection, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.userAvatar}>
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>P</Text>
          </LinearGradient>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            Parent
          </Text>
          <View style={styles.userBadges}>
            <View style={[styles.userBadge, { backgroundColor: theme.colors.info + '20' }]}>
              <Ionicons name="shield-checkmark" size={12} color={theme.colors.info} />
              <Text style={[styles.userBadgeText, { color: theme.colors.info }]}>
                Parent
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView style={styles.navigation} showsVerticalScrollIndicator={false}>
        {navigation_items.map(item => renderNavItem(item))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          activeOpacity={0.7}
          onPress={async () => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Déconnecter', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('Starting logout...');
                      
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
                      if (Platform.OS === 'web') {
                        window.location.href = '/';
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Force logout even if server fails
                      dispatch(logout());
                      await persistor.purge();
                      if (Platform.OS === 'web') {
                        window.location.href = '/';
                      }
                    }
                  }
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userBadges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  userBadgeText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  navigation: {
    flex: 1,
    padding: 12,
  },
  menuGroup: {
    marginBottom: 4,
  },
  navItem: {
    borderRadius: 8,
    marginBottom: 2,
    position: 'relative',
  },
  childNavItem: {
    marginLeft: 20,
  },
  activeNavItem: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 4,
    height: 32,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ translateY: -16 }],
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    marginRight: 12,
  },
  navText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  childNavText: {
    fontSize: 13,
  },
  activeText: {
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 'auto',
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subMenu: {
    marginTop: 2,
    marginBottom: 4,
  },
  bottomActions: {
    padding: 12,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Sidebar;