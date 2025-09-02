import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootStackParamList } from '../../types/app/navigation';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';
import { useChildren } from '../../hooks/useChildren';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled(LinearGradient).attrs({
  colors: ['#007AFF', '#0051D5'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  padding: 30px 20px;
  align-items: center;
`;

const Avatar = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: white;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const AvatarText = styled.Text`
  font-size: 40px;
`;

const UserName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
`;

const UserEmail = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const Section = styled.View`
  background-color: white;
  margin: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding: 16px 16px 8px;
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const MenuItemIcon = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #F5F5F5;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const MenuItemContent = styled.View`
  flex: 1;
`;

const MenuItemTitle = styled.Text`
  font-size: 15px;
  color: #333;
  margin-bottom: 2px;
`;

const MenuItemSubtitle = styled.Text`
  font-size: 12px;
  color: #999;
`;

const MenuItemRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const MenuItemValue = styled.Text`
  font-size: 14px;
  color: #666;
  margin-right: 8px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: #FF3B30;
  margin: 16px;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const LogoutButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export default function ProfileScreen({ navigation, route }: Props) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { children } = useChildren();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || 'Parent');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            // Le RootNavigator va automatiquement afficher AuthNavigator après logout
            // Pas besoin de reset() car l'état d'authentification gère la navigation
          }
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // TODO: Implémenter la sauvegarde via API
    Alert.alert('Succès', 'Profil mis à jour avec succès');
    setEditModalVisible(false);
  };

  const accountSettings: SettingItem[] = [
    {
      icon: 'person',
      title: 'Informations personnelles',
      subtitle: 'Modifier vos informations',
      onPress: () => setEditModalVisible(true),
    },
    {
      icon: 'lock-closed',
      title: 'Changer le mot de passe',
      subtitle: 'Sécurisez votre compte',
      onPress: () => Alert.alert('Mot de passe', 'Fonctionnalité à venir'),
    },
    {
      icon: 'people',
      title: 'Gérer les enfants',
      subtitle: `${children.length} enfant${children.length !== 1 ? 's' : ''} enregistré${children.length !== 1 ? 's' : ''}`,
      onPress: () => navigation.navigate('Children' as never),
    },
    {
      icon: 'mail',
      title: 'Invitations',
      subtitle: 'Inviter des co-parents',
      onPress: () => navigation.navigate('Invitation' as never),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Recevoir les alertes',
      hasSwitch: true,
      switchValue: notifications,
      onSwitchChange: setNotifications,
    },
    {
      icon: 'volume-high',
      title: 'Effets sonores',
      subtitle: 'Sons dans l\'application',
      hasSwitch: true,
      switchValue: soundEffects,
      onSwitchChange: setSoundEffects,
    },
    {
      icon: 'moon',
      title: 'Mode sombre',
      subtitle: 'Thème de l\'application',
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchChange: setDarkMode,
    },
    {
      icon: 'language',
      title: 'Langue',
      subtitle: 'Français',
      value: 'FR',
      onPress: () => Alert.alert('Langue', 'Fonctionnalité à venir'),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      icon: 'help-circle',
      title: 'Aide et support',
      subtitle: 'Centre d\'aide',
      onPress: () => Alert.alert('Aide', 'Centre d\'aide à venir'),
    },
    {
      icon: 'information-circle',
      title: 'À propos',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert('À propos', 'Kids Points App v1.0.0\n\nApplication de gestion de points pour enfants'),
    },
    {
      icon: 'document-text',
      title: 'Conditions d\'utilisation',
      onPress: () => Alert.alert('Conditions', 'Conditions d\'utilisation à venir'),
    },
    {
      icon: 'shield-checkmark',
      title: 'Politique de confidentialité',
      onPress: () => Alert.alert('Confidentialité', 'Politique de confidentialité à venir'),
    },
  ];

  const renderMenuItem = (item: SettingItem, isLast: boolean) => (
    <MenuItem 
      key={item.title} 
      onPress={item.onPress}
      disabled={item.hasSwitch}
      style={{ borderBottomWidth: isLast ? 0 : 1 }}
    >
      <MenuItemIcon>
        <Ionicons name={item.icon as any} size={20} color="#007AFF" />
      </MenuItemIcon>
      <MenuItemContent>
        <MenuItemTitle>{item.title}</MenuItemTitle>
        {item.subtitle && <MenuItemSubtitle>{item.subtitle}</MenuItemSubtitle>}
      </MenuItemContent>
      <MenuItemRight>
        {item.value && <MenuItemValue>{item.value}</MenuItemValue>}
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor={item.switchValue ? 'white' : '#F4F3F4'}
          />
        ) : (
          item.onPress && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </MenuItemRight>
    </MenuItem>
  );

  return (
    <WebScreenWrapper
      title="Profil"
      subtitle="Gérez vos informations personnelles"
      icon="person"
    >
      <Container>
      <ScrollView>
        <Header>
          <Avatar>
            <AvatarText>👤</AvatarText>
          </Avatar>
          <UserName>{user?.name || 'Parent'}</UserName>
          <UserEmail>{user?.email || 'parent@famille.com'}</UserEmail>
        </Header>
        
        <Section>
          <SectionTitle>Compte</SectionTitle>
          {accountSettings.map((item, index) => 
            renderMenuItem(item, index === accountSettings.length - 1)
          )}
        </Section>
        
        <Section>
          <SectionTitle>Application</SectionTitle>
          {appSettings.map((item, index) => 
            renderMenuItem(item, index === appSettings.length - 1)
          )}
        </Section>
        
        <Section>
          <SectionTitle>Support</SectionTitle>
          {supportSettings.map((item, index) => 
            renderMenuItem(item, index === supportSettings.length - 1)
          )}
        </Section>
        
        <LogoutButton onPress={handleLogout}>
          <LogoutButtonText>Se déconnecter</LogoutButtonText>
        </LogoutButton>
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.modalInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Votre nom"
                placeholderTextColor="#999"
              />
              
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Votre email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </Container>
    </WebScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;