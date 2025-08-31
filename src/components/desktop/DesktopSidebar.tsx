import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  requiresParent?: boolean;
  requiresChild?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
  { label: 'Enfants', icon: 'people', route: 'Children', requiresParent: true },
  { label: 'Missions', icon: 'assignment', route: 'Missions' },
  { label: 'Récompenses', icon: 'card-giftcard', route: 'Rewards' },
  { label: 'Validations', icon: 'check-circle', route: 'Validations', requiresParent: true },
  { label: 'Tournois', icon: 'emoji-events', route: 'Tournaments' },
  { label: 'Guildes', icon: 'groups', route: 'Guilds' },
  { label: 'Compagnons', icon: 'pets', route: 'Pets' },
  { label: 'Statistiques', icon: 'bar-chart', route: 'Statistics' },
  { label: 'Sparky AI', icon: 'psychology', route: 'Sparky' },
  { label: 'Paramètres', icon: 'settings', route: 'Settings' },
];

export const DesktopSidebar: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { colors, isDarkMode } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const selectedChild = useSelector((state: RootState) => state.children.selectedChild);
  const isParent = user?.role === 'PARENT';

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresParent && !isParent) return false;
    if (item.requiresChild && !selectedChild) return false;
    return true;
  });

  const handleNavigate = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Logo and Brand */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.logo}>
          <Text style={[styles.logoText, { color: colors.primary }]}>🎯</Text>
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>Kids Points</Text>
      </View>

      {/* User Profile Section */}
      <TouchableOpacity
        style={[styles.profileSection, { backgroundColor: colors.background }]}
        onPress={() => handleNavigate('Profile')}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            {isParent ? 'Parent' : 'Enfant'}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Selected Child (if parent) */}
      {isParent && selectedChild && (
        <TouchableOpacity
          style={[styles.childSelector, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleNavigate('ChildSelection')}
        >
          <Text style={[styles.childAvatar, { fontSize: 20 }]}>
            {selectedChild.avatar}
          </Text>
          <Text style={[styles.childName, { color: colors.primary }]}>
            {(selectedChild as any).name || `${selectedChild.firstName} ${selectedChild.lastName}`}
          </Text>
          <Icon name="swap-horiz" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Navigation Menu */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {filteredMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
            ]}
            onPress={() => handleNavigate(item.route)}
            activeOpacity={0.7}
          >
            <Icon name={item.icon} size={24} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            {item.badge && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => handleNavigate('Help')}
        >
          <Icon name="help-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.bottomActionText, { color: colors.textSecondary }]}>
            Aide
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => {
            // Handle logout
          }}
        >
          <Icon name="logout" size={24} color={colors.textSecondary} />
          <Text style={[styles.bottomActionText, { color: colors.textSecondary }]}>
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
    width: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  logo: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  childSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  childAvatar: {
    marginRight: 8,
  },
  childName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActions: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  bottomActionText: {
    marginLeft: 16,
    fontSize: 14,
  },
});