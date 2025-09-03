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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { childrenService, type Child } from '../../services/children.service';
import { AppSpacing, CommonStyles } from '../../constants/spacing';
import PinValidationModal from '../../components/auth/PinValidationModal';

interface ChildFormData {
  firstName: string;
  lastName: string;
  avatar: string;
  age: string;
  email?: string;
  password?: string;
}

const ChildProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const childId = (route.params as any)?.childId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!childId);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [child, setChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState<ChildFormData>({
    firstName: '',
    lastName: '',
    avatar: '👦',
    age: '',
    email: '',
    password: '',
  });

  const avatars = ['👦', '👧', '🧒', '👶', '🦸‍♂️', '🦸‍♀️', '🤖', '🦄', '🐻', '🦊', '🦁', '🐼'];

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      setIsLoading(true);
      const childData = await childrenService.getChildById(childId);
      if (childData) {
        setChild(childData);
        setFormData({
          firstName: childData.firstName || '',
          lastName: childData.lastName || '',
          avatar: childData.avatar || '👦',
          age: childData.age?.toString() || '',
          email: childData.email || '',
          password: '',
        });
      }
    } catch (error) {
      console.error('Failed to load child:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return;
    }

    if (!formData.age || parseInt(formData.age) < 3 || parseInt(formData.age) > 18) {
      Alert.alert('Erreur', 'L\'âge doit être entre 3 et 18 ans');
      return;
    }

    // Demander le code PIN parent
    setPendingAction(() => performSave);
    setShowPinModal(true);
  };

  const performSave = async () => {
    setIsLoading(true);
    try {
      const childData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        avatar: formData.avatar,
        age: parseInt(formData.age),
        email: formData.email?.trim(),
        password: formData.password?.trim(),
      };

      if (childId) {
        // Mise à jour
        await childrenService.updateChild(childId, childData);
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setIsEditing(false);
        loadChild();
      } else {
        // Création
        await childrenService.createChild(childData);
        Alert.alert('Succès', 'Enfant ajouté avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Failed to save child:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setPendingAction(() => performDelete);
            setShowPinModal(true);
          }
        }
      ]
    );
  };

  const performDelete = async () => {
    setIsLoading(true);
    try {
      await childrenService.deleteChild(childId);
      Alert.alert('Succès', 'Profil supprimé', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to delete child:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinValidation = (isValid: boolean) => {
    setShowPinModal(false);
    if (isValid) {
      pendingAction();
    } else {
      Alert.alert('Erreur', 'Code PIN incorrect');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {childId ? (isEditing ? 'Modifier le profil' : 'Profil enfant') : 'Ajouter un enfant'}
        </Text>
        {childId && !isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Avatar
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  {
                    backgroundColor: formData.avatar === avatar 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: formData.avatar === avatar 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  },
                ]}
                onPress={() => isEditing && setFormData(prev => ({ ...prev, avatar }))}
                disabled={!isEditing}
              >
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations personnelles
          </Text>
          
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Prénom *"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            editable={isEditing}
          />

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Nom"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            editable={isEditing}
          />

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Âge *"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.age}
            onChangeText={(text) => setFormData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={2}
            editable={isEditing}
          />
        </View>

        {/* Account Info (optional) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Compte (optionnel)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Pour permettre à l'enfant de se connecter seul
          </Text>
          
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />

          {(!childId || formData.password) && (
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder={childId ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry
              editable={isEditing}
            />
          )}
        </View>

        {/* Statistics (if editing existing child) */}
        {child && !isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Statistiques
            </Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statValue}>{child.currentPoints || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Points actuels
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statValue}>{child.totalPointsEarned || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Points gagnés
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statValue}>{child.missionsCompleted || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Missions
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statValue}>{child.rewardsClaimed || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Récompenses
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                if (childId) {
                  setIsEditing(false);
                  loadChild();
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            {childId && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: '#EF4444',
                  },
                ]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* PIN Validation Modal */}
      <PinValidationModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onValidate={handlePinValidation}
        title="Validation parent"
        message="Entrez votre code PIN pour valider cette action"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: CommonStyles.container,
  header: CommonStyles.header,
  backButton: CommonStyles.backButton,
  headerTitle: CommonStyles.headerTitle,
  editButton: {
    padding: 8,
  },
  content: CommonStyles.content,
  section: CommonStyles.section,
  sectionTitle: CommonStyles.sectionTitle,
  sectionSubtitle: CommonStyles.sectionSubtitle,
  textInput: CommonStyles.textInput,
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,  // Réduit de 20px à 10px comme demandé
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: CommonStyles.button,
  saveButtonText: CommonStyles.buttonText,
  cancelButton: {
    ...CommonStyles.button,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    ...CommonStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    ...CommonStyles.buttonText,
    marginLeft: 8,
  },
  bottomPadding: CommonStyles.bottomPadding,
});

export default ChildProfileScreen;