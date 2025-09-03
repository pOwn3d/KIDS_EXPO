import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAsync, selectCurrentUser } from '../../store/slices/authSlice';

interface UserProfile {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

const ProfileHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  // Utiliser les données de Redux
  const userProfile = {
    email: currentUser?.email || 'Non défini',
    firstName: currentUser?.firstName || currentUser?.first_name || '',
    lastName: currentUser?.lastName || currentUser?.last_name || '',
    role: currentUser?.roles?.[0]?.replace('ROLE_', '') || 'User'
  };


  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: confirmLogout,
        },
      ]
    );
  };

  const confirmLogout = async () => {
    try {
      setIsLoading(true);
      
      // Utiliser Redux pour gérer la déconnexion
      await dispatch(logoutAsync() as any);
      
      // La navigation vers Auth se fera automatiquement quand isAuthenticated devient false
      
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
    title, 
    children 
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {children}
      </View>
    </View>
  );

  const ProfileItem: React.FC<{
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
  }> = ({ icon, label, value, onPress }) => (
    <TouchableOpacity 
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        <Text style={[styles.profileItemLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.profileItemRight}>
        <Text style={[styles.profileItemValue, { color: theme.colors.textSecondary }]}>
          {value}
        </Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const ActionButton: React.FC<{
    icon: string;
    title: string;
    color: string;
    onPress: () => void;
    loading?: boolean;
  }> = ({ icon, title, color, onPress, loading = false }) => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={loading ? "hourglass-outline" : icon as any} 
        size={24} 
        color="#FFFFFF" 
      />
      <Text style={styles.actionButtonText}>
        {loading ? 'Chargement...' : title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        
        {/* Header Profile */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {userProfile.firstName || userProfile.lastName 
                ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
                : 'Utilisateur'
              }
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {userProfile.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                {userProfile.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Informations du compte */}
        <ProfileSection title="Informations du compte">
          <ProfileItem
            icon="mail-outline"
            label="Email"
            value={userProfile.email || 'Non défini'}
          />
          <ProfileItem
            icon="person-outline"
            label="Prénom"
            value={userProfile.firstName || 'Non défini'}
          />
          <ProfileItem
            icon="person-outline"
            label="Nom"
            value={userProfile.lastName || 'Non défini'}
          />
          <ProfileItem
            icon="shield-checkmark-outline"
            label="Rôle"
            value={userProfile.role || 'User'}
          />
        </ProfileSection>

        {/* Actions rapides */}
        <ProfileSection title="Actions">
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: theme.colors.background }]}
              onPress={() => {/* Navigate to settings */}}
            >
              <Ionicons name="settings-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                Paramètres
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: theme.colors.background }]}
              onPress={() => {/* Navigate to help */}}
            >
              <Ionicons name="help-circle-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                Aide
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: theme.colors.background }]}
              onPress={() => {/* Navigate to about */}}
            >
              <Ionicons name="information-circle-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                À propos
              </Text>
            </TouchableOpacity>
          </View>
        </ProfileSection>

        {/* Bouton de déconnexion */}
        <View style={styles.logoutSection}>
          <ActionButton
            icon="log-out-outline"
            title="Se déconnecter"
            color="#DC2626"
            onPress={handleLogout}
            loading={isLoading}
          />
        </View>

        {/* Version info */}
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Version 1.0.0 • Kids Points App
          </Text>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Platform: {Platform.OS} • {Platform.Version}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    marginRight: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  quickAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  logoutSection: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 32,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ProfileHomeScreen;