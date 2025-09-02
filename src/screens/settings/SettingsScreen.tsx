import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../store/slices/authSlice';
import { selectCurrentUser } from '../../store/store';
import { authService } from '../../services/auth.service';
import { childrenService } from '../../services/children.service';
import { persistor } from '../../store/store';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface SettingsSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  gradient?: string[];
}

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value?: string | boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  type?: 'button' | 'switch' | 'text' | 'navigation';
  danger?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  icon, 
  children, 
  gradient = ['#0EA5E9', '#0284C7'] 
}) => {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeader}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </LinearGradient>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  value,
  onPress,
  onToggle,
  type = 'button',
  danger = false,
}) => {
  const theme = useTheme();

  const renderValue = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value as boolean}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
            thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
          />
        );
      case 'text':
        return (
          <Text style={[styles.itemValue, danger && styles.dangerText]}>
            {value}
          </Text>
        );
      case 'navigation':
        return (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        {icon && (
          <View style={[styles.itemIcon, danger && styles.dangerIcon]}>
            <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
          </View>
        )}
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {renderValue()}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  
  const [isLoading, setIsLoading] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [manageFamilyModalVisible, setManageFamilyModalVisible] = useState(false);
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Profile edit states
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Family management
  const [children, setChildren] = useState<any[]>([]);
  const [newChildName, setNewChildName] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await childrenService.getChildren();
      setChildren(response);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to update profile
      const updatedUser = {
        ...currentUser,
        firstName,
        lastName,
        email,
      };
      
      dispatch(updateUser(updatedUser));
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setEditProfileModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to change password
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setChangePasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    setIsLoading(true);
    try {
      await childrenService.createChild({
        firstName: newChildName,
        lastName: currentUser?.lastName || '',
        dateOfBirth: new Date().toISOString(),
      });
      
      await loadChildren();
      setNewChildName('');
      Alert.alert('Succès', 'Enfant ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'enfant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir retirer cet enfant ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to remove child
              await loadChildren();
              Alert.alert('Succès', 'Enfant retiré avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de retirer l\'enfant');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              dispatch(logout());
              await persistor.purge();
              
              if (Platform.OS === 'web') {
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const contentPadding = isDesktop ? 40 : isTablet ? 24 : 16;
  const maxWidth = isDesktop ? 1200 : isTablet ? 800 : '100%';

  return (
    <WebScreenWrapper
      title="Paramètres"
      subtitle="Configurez votre application"
      icon="settings"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            padding: contentPadding,
            alignItems: 'center',
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, { maxWidth }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontSize: isDesktop ? 32 : 28 }]}>
              Paramètres
            </Text>
            <Text style={styles.headerSubtitle}>
              Gérez votre compte et vos préférences
            </Text>
          </View>

          {/* Profile Section */}
          <SettingsSection 
            title="Profil" 
            icon="person-circle"
            gradient={['#0EA5E9', '#0284C7']}
          >
            <SettingsItem
              title={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`}
              subtitle={currentUser?.email}
              icon="person"
              type="navigation"
              onPress={() => setEditProfileModalVisible(true)}
            />
            <SettingsItem
              title="Changer le mot de passe"
              icon="lock-closed"
              type="navigation"
              onPress={() => setChangePasswordModalVisible(true)}
            />
            <SettingsItem
              title="Code PIN"
              subtitle="****"
              icon="keypad"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
          </SettingsSection>

          {/* Family Management Section */}
          <SettingsSection 
            title="Gestion de la Famille" 
            icon="people"
            gradient={['#10B981', '#059669']}
          >
            <SettingsItem
              title="Gérer les enfants"
              subtitle={`${children.length} enfant${children.length > 1 ? 's' : ''}`}
              icon="people-circle"
              type="navigation"
              onPress={() => setManageFamilyModalVisible(true)}
            />
            <SettingsItem
              title="Invitations"
              subtitle="Inviter un co-parent"
              icon="person-add"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              title="Permissions"
              subtitle="Gérer les accès"
              icon="shield-checkmark"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection 
            title="Notifications" 
            icon="notifications"
            gradient={['#F59E0B', '#D97706']}
          >
            <SettingsItem
              title="Notifications Push"
              subtitle="Recevoir des notifications"
              icon="notifications-circle"
              type="switch"
              value={notifications}
              onToggle={setNotifications}
            />
            <SettingsItem
              title="Notifications Email"
              subtitle="Recevoir des emails"
              icon="mail"
              type="switch"
              value={emailNotifications}
              onToggle={setEmailNotifications}
            />
            <SettingsItem
              title="Sons"
              subtitle="Effets sonores dans l'app"
              icon="volume-high"
              type="switch"
              value={soundEffects}
              onToggle={setSoundEffects}
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection 
            title="Préférences" 
            icon="settings"
            gradient={['#A855F7', '#9333EA']}
          >
            <SettingsItem
              title="Mode Sombre"
              subtitle="Theme de l'application"
              icon="moon"
              type="switch"
              value={darkMode}
              onToggle={setDarkMode}
            />
            <SettingsItem
              title="Sauvegarde Automatique"
              subtitle="Sauvegarder les données"
              icon="cloud-upload"
              type="switch"
              value={autoBackup}
              onToggle={setAutoBackup}
            />
            <SettingsItem
              title="Langue"
              subtitle="Français"
              icon="language"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection 
            title="Support" 
            icon="help-circle"
            gradient={['#6366F1', '#4F46E5']}
          >
            <SettingsItem
              title="Centre d'aide"
              icon="help-circle-outline"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              title="Contacter le support"
              icon="chatbubble-ellipses"
              type="navigation"
              onPress={() => Alert.alert('Info', 'support@kidspoints.com')}
            />
            <SettingsItem
              title="Conditions d'utilisation"
              icon="document-text"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              title="Politique de confidentialité"
              icon="shield"
              type="navigation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              title="Version"
              icon="information-circle"
              type="text"
              value="1.0.0"
            />
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection 
            title="Zone Dangereuse" 
            icon="warning"
            gradient={['#EF4444', '#DC2626']}
          >
            <SettingsItem
              title="Supprimer le compte"
              subtitle="Cette action est irréversible"
              icon="trash"
              type="button"
              danger
              onPress={() => Alert.alert(
                'Supprimer le compte',
                'Cette action est irréversible. Êtes-vous sûr ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive' }
                ]
              )}
            />
            <SettingsItem
              title="Déconnexion"
              icon="log-out"
              type="button"
              danger
              onPress={handleLogout}
            />
          </SettingsSection>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileModalVisible}
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.modalTitle}>Modifier le Profil</Text>
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Prénom"
              placeholderTextColor={theme.colors.textLight}
              value={firstName}
              onChangeText={setFirstName}
            />
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Nom"
              placeholderTextColor={theme.colors.textLight}
              value={lastName}
              onChangeText={setLastName}
            />
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Téléphone"
              placeholderTextColor={theme.colors.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.modalTitle}>Changer le Mot de Passe</Text>
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Mot de passe actuel"
              placeholderTextColor={theme.colors.textLight}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={theme.colors.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={theme.colors.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setChangePasswordModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Modifier</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage Family Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={manageFamilyModalVisible}
        onRequestClose={() => setManageFamilyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.modalTitle}>Gérer les Enfants</Text>
            
            <View style={styles.addChildContainer}>
              <TextInput
                style={[styles.input, styles.addChildInput, { borderColor: theme.colors.border }]}
                placeholder="Nom de l'enfant"
                placeholderTextColor={theme.colors.textLight}
                value={newChildName}
                onChangeText={setNewChildName}
              />
              <TouchableOpacity
                style={[styles.addChildButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddChild}
                disabled={isLoading}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.childrenList}>
              {children.map((child) => (
                <View key={child.id} style={styles.childItem}>
                  <View style={styles.childInfo}>
                    <Ionicons name="person-circle" size={32} color={theme.colors.primary} />
                    <View style={styles.childTextInfo}>
                      <Text style={styles.childName}>{child.firstName}</Text>
                      <Text style={styles.childPoints}>{child.points || 0} points</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveChild(child.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {children.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>Aucun enfant ajouté</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setManageFamilyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </WebScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentWrapper: {
    width: '100%',
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  itemValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerText: {
    color: '#EF4444',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  largeModal: {
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmButton: {
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  addChildContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addChildInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addChildButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenList: {
    maxHeight: 300,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childTextInfo: {
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  childPoints: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default SettingsScreen;