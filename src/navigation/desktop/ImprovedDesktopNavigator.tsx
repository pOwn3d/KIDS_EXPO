import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  TextInput,
  Alert,
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
import parentSessionService from '../../services/parentSession.service';
import ParentZone from '../../components/navigation/ParentZone';

// Import stack navigators
import DashboardStackNavigator from '../stacks/DashboardStackNavigator';
import ChildrenStackNavigator from '../stacks/ChildrenStackNavigator';
import MissionsStackNavigator from '../stacks/MissionsStackNavigator';
import RewardsStackNavigator from '../stacks/RewardsStackNavigator';
import PunishmentsStackNavigator from '../stacks/PunishmentsStackNavigator';
import ProfileStackNavigator from '../stacks/ProfileStackNavigator';
import SettingsStackNavigator from '../stacks/SettingsStackNavigator';
import LeaderboardStackNavigator from '../stacks/LeaderboardStackNavigator';
import TournamentsStackNavigator from '../stacks/TournamentsStackNavigator';
import GuildsStackNavigator from '../stacks/GuildsStackNavigator';
import ActivitiesStackNavigator from '../stacks/ActivitiesStackNavigator';
import BadgesStackNavigator from '../stacks/BadgesStackNavigator';

// Import validation screens
import MissionValidationScreen from '../../screens/missions/MissionValidationScreen';
import RewardClaimsScreen from '../../screens/rewards/RewardClaimsScreen';

// Types
import { MainDrawerParamList } from '../../types/app/navigation';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Créer des composants wrappés en dehors du render pour éviter les re-créations
const ChildrenWithParentZone = () => (
  <ParentZone requiresAuth>
    <ChildrenStackNavigator />
  </ParentZone>
);

const PunishmentsWithParentZone = () => (
  <ParentZone requiresAuth>
    <PunishmentsStackNavigator />
  </ParentZone>
);

const ProfileWithParentZone = () => (
  <ParentZone requiresAuth>
    <ProfileStackNavigator />
  </ParentZone>
);

const SettingsWithParentZone = () => (
  <ParentZone requiresAuth>
    <SettingsStackNavigator />
  </ParentZone>
);

const MissionValidationWithParentZone = () => (
  <ParentZone requiresAuth>
    <MissionValidationScreen />
  </ParentZone>
);

const RewardClaimsWithParentZone = () => (
  <ParentZone requiresAuth>
    <RewardClaimsScreen />
  </ParentZone>
);

// Custom Sidebar avec sections séparées
const ImprovedSidebar: React.FC<any> = ({ navigation, state }) => {
  const activeRoute = state.routes[state.index].name;
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [isExpanded, setIsExpanded] = useState(isDesktop);
  const [isParentMode, setIsParentMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  
  useEffect(() => {
    checkParentSession();
    // Vérifier périodiquement l'état de la session
    const interval = setInterval(checkParentSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkParentSession = async () => {
    const isActive = await parentSessionService.isSessionActive();
    setIsParentMode(isActive);
  };
  
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) return;
    }
    
    try {
      await authService.logout();
      await parentSessionService.endSession();
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

  const handleParentZoneClick = async () => {
    const isActive = await parentSessionService.isSessionActive();
    if (!isActive) {
      // Afficher la modal PIN pour s'authentifier
      setShowPinModal(true);
    } else {
      // Si déjà authentifié, proposer de se déconnecter
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Voulez-vous quitter la zone parent ?');
        if (confirmed) {
          await parentSessionService.endSession();
          setIsParentMode(false);
          navigation.navigate('Dashboard');
        }
      }
    }
  };

  const handlePinSubmit = async () => {
    const isValid = await parentSessionService.verifyPin(pin);
    if (isValid) {
      await parentSessionService.startSession(pin);
      setIsParentMode(true);
      setShowPinModal(false);
      setPin('');
      // Rafraîchir la page pour que tous les ParentZone se mettent à jour
      window.location.reload();
    } else {
      if (Platform.OS === 'web') {
        window.alert('Code PIN incorrect');
      }
      setPin('');
    }
  };
  
  // Menus séparés pour enfants et parents
  const childMenuItems = [
    { name: 'Dashboard', label: 'Tableau de bord', icon: 'grid', color: '#0EA5E9' },
    { name: 'Missions', label: 'Mes Missions', icon: 'checkmark-circle', color: '#10B981' },
    { name: 'Rewards', label: 'Boutique Récompenses', icon: 'gift', color: '#F59E0B' },
    { name: 'Activities', label: 'Activités', icon: 'analytics', color: '#A855F7' },
    { name: 'Badges', label: 'Mes Badges', icon: 'ribbon', color: '#EC4899' },
    { name: 'Leaderboard', label: 'Classement', icon: 'trophy', color: '#F97316' },
    // { name: 'Tournaments', label: 'Tournois', icon: 'medal', color: '#6366F1' }, // À développer plus tard
    // { name: 'Guilds', label: 'Guildes', icon: 'shield', color: '#8B5CF6' }, // À développer plus tard
  ];

  const parentMenuItems = [
    { name: 'Children', label: 'Gestion Enfants', icon: 'people', color: '#2196F3', requiresPin: true },
    { name: 'MissionValidation', label: 'Valider Missions', icon: 'checkmark-done', color: '#10B981', requiresPin: true },
    { name: 'RewardClaims', label: 'Valider Récompenses', icon: 'gift-outline', color: '#F59E0B', requiresPin: true },
    { name: 'Punishments', label: 'Punitions', icon: 'warning', color: '#EF4444', requiresPin: true },
    { name: 'Profile', label: 'Profil Famille', icon: 'person-circle', color: '#64748B', requiresPin: true },
    { name: 'Settings', label: 'Paramètres', icon: 'settings', color: '#64748B', requiresPin: true },
  ];

  const sidebarWidth = isExpanded ? 280 : 80;

  const styles = StyleSheet.create({
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
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: '#9CA3AF',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginLeft: 12,
      textTransform: 'uppercase',
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
    menuItemIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isExpanded ? 12 : 0,
    },
    menuItemText: {
      fontSize: 14,
      color: '#374151',
      flex: 1,
    },
    menuItemTextActive: {
      color: '#0EA5E9',
      fontWeight: '600',
    },
    activeDot: {
      position: 'absolute',
      right: 8,
      width: 4,
      height: 20,
      borderRadius: 2,
      backgroundColor: '#0EA5E9',
    },
    parentZoneButton: {
      margin: 12,
      padding: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    parentZoneButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    footer: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#FEE2E2',
    },
    logoutText: {
      marginLeft: 8,
      color: '#EF4444',
      fontSize: 14,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 16,
      marginHorizontal: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      width: 400,
      maxWidth: '90%',
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    modalIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#6366F1',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
    },
    pinInput: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 16,
      fontSize: 24,
      textAlign: 'center',
      letterSpacing: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      backgroundColor: '#6366F1',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#F3F4F6',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    cancelButtonText: {
      color: '#111827',
    },
  });

  return (
    <SafeAreaView style={[styles.sidebar, { width: sidebarWidth }]}>
      {/* Header */}
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
              <Text style={styles.userEmail}>{currentUser?.email || 'utilisateur@famille.com'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Navigation Menu */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {/* Section Enfant */}
        <View style={styles.menuSection}>
          {isExpanded && <Text style={styles.sectionTitle}>Espace Enfant</Text>}
          {childMenuItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigation.navigate(item.name as any)}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                {isExpanded && (
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                )}
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Section Parent */}
        <View style={styles.menuSection}>
          {isExpanded && <Text style={styles.sectionTitle}>Zone Parent</Text>}
          
          {/* Bouton d'accès à la zone parent */}
          <LinearGradient
            colors={isParentMode ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.parentZoneButton}
          >
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={handleParentZoneClick}
            >
              <Ionicons 
                name={isParentMode ? "lock-open" : "lock-closed"} 
                size={20} 
                color="#FFFFFF" 
              />
              {isExpanded && (
                <Text style={styles.parentZoneButtonText}>
                  {isParentMode ? 'Zone Parent Active' : 'Accéder Zone Parent'}
                </Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {/* Menu parent */}
          {parentMenuItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigation.navigate(item.name as any)}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                {isExpanded && (
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                )}
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          {isExpanded && <Text style={styles.logoutText}>Déconnexion</Text>}
        </TouchableOpacity>
      </View>

      {/* Modal PIN */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Code PIN Parent</Text>
              <Text style={styles.modalSubtitle}>
                Entrez votre code PIN pour accéder à la zone parent
              </Text>
            </View>

            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="• • • •"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { opacity: pin.length !== 4 ? 0.5 : 1 }]}
                onPress={handlePinSubmit}
                disabled={pin.length !== 4}
              >
                <Text style={styles.modalButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Improved Desktop navigator with parent zone protection
 */
const ImprovedDesktopNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Drawer.Navigator
        drawerContent={(props) => <ImprovedSidebar {...props} />}
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
        {/* Écrans accessibles aux enfants */}
        <Drawer.Screen name="Dashboard" component={DashboardStackNavigator} />
        <Drawer.Screen name="Missions" component={MissionsStackNavigator} />
        <Drawer.Screen name="Rewards" component={RewardsStackNavigator} />
        <Drawer.Screen name="Activities" component={ActivitiesStackNavigator} />
        <Drawer.Screen name="Badges" component={BadgesStackNavigator} />
        <Drawer.Screen name="Leaderboard" component={LeaderboardStackNavigator} />
        {/* <Drawer.Screen name="Tournaments" component={TournamentsStackNavigator} /> */}
        {/* <Drawer.Screen name="Guilds" component={GuildsStackNavigator} /> */}
        
        {/* Écrans protégés par PIN parent */}
        <Drawer.Screen 
          name="Children" 
          component={ChildrenWithParentZone}
        />
        <Drawer.Screen 
          name="MissionValidation" 
          component={MissionValidationWithParentZone}
        />
        <Drawer.Screen 
          name="RewardClaims" 
          component={RewardClaimsWithParentZone}
        />
        <Drawer.Screen 
          name="Punishments" 
          component={PunishmentsWithParentZone}
        />
        <Drawer.Screen 
          name="Profile" 
          component={ProfileWithParentZone}
        />
        <Drawer.Screen 
          name="Settings" 
          component={SettingsWithParentZone}
        />
      </Drawer.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default ImprovedDesktopNavigator;