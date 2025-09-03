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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { childrenService, type Child } from '../../services/children.service';
import PinValidationModal from '../../components/auth/PinValidationModal';
import { AppSpacing, CommonStyles } from '../../constants/spacing';

interface Punishment {
  id: string;
  name: string;
  description: string;
  pointsDeduction: number;
  duration?: string;
  severity: 'light' | 'medium' | 'severe';
  icon: string;
}

const PunishmentManagementScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPunishment, setPendingPunishment] = useState<Punishment | null>(null);
  
  const [newPunishment, setNewPunishment] = useState({
    name: '',
    description: '',
    pointsDeduction: '',
    duration: '',
    severity: 'light' as 'light' | 'medium' | 'severe',
  });

  const predefinedPunishments: Punishment[] = [
    {
      id: '1',
      name: 'Temps d\'écran réduit',
      description: 'Moins de temps sur les écrans pendant 1 jour',
      pointsDeduction: 50,
      duration: '1 jour',
      severity: 'light',
      icon: '📱',
    },
    {
      id: '2',
      name: 'Pas de dessert',
      description: 'Pas de dessert au prochain repas',
      pointsDeduction: 30,
      duration: '1 repas',
      severity: 'light',
      icon: '🍰',
    },
    {
      id: '3',
      name: 'Corvée supplémentaire',
      description: 'Une tâche ménagère en plus',
      pointsDeduction: 40,
      severity: 'light',
      icon: '🧹',
    },
    {
      id: '4',
      name: 'Coucher plus tôt',
      description: '30 minutes plus tôt pendant 2 jours',
      pointsDeduction: 60,
      duration: '2 jours',
      severity: 'medium',
      icon: '🛏️',
    },
    {
      id: '5',
      name: 'Pas de sortie',
      description: 'Interdiction de sortir avec les amis',
      pointsDeduction: 100,
      duration: '1 semaine',
      severity: 'medium',
      icon: '🚫',
    },
    {
      id: '6',
      name: 'Privé de console',
      description: 'Pas de jeux vidéo pendant 3 jours',
      pointsDeduction: 80,
      duration: '3 jours',
      severity: 'medium',
      icon: '🎮',
    },
    {
      id: '7',
      name: 'Téléphone confisqué',
      description: 'Téléphone confisqué pour la journée',
      pointsDeduction: 120,
      duration: '1 jour',
      severity: 'severe',
      icon: '📵',
    },
    {
      id: '8',
      name: 'Activités annulées',
      description: 'Pas d\'activités extra-scolaires',
      pointsDeduction: 150,
      duration: '1 semaine',
      severity: 'severe',
      icon: '❌',
    },
  ];

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      const data = await childrenService.getAllChildren();
      setChildren(data);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPunishment = (punishment: Punishment) => {
    if (!selectedChild) {
      Alert.alert('Erreur', 'Veuillez sélectionner un enfant');
      return;
    }

    setPendingPunishment(punishment);
    setShowPinModal(true);
  };

  const confirmPunishment = async () => {
    if (!selectedChild || !pendingPunishment) return;

    try {
      // TODO: Appeler l'API pour appliquer la punition
      Alert.alert(
        'Punition appliquée',
        `${pendingPunishment.name} a été appliqué à ${selectedChild.firstName}.\n\n` +
        `${pendingPunishment.pointsDeduction} points ont été retirés.`,
        [{ text: 'OK' }]
      );
      
      setPendingPunishment(null);
      setSelectedChild(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'appliquer la punition');
    }
  };

  const handleCreateCustomPunishment = () => {
    if (!newPunishment.name || !newPunishment.description || !newPunishment.pointsDeduction) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const customPunishment: Punishment = {
      id: Date.now().toString(),
      name: newPunishment.name,
      description: newPunishment.description,
      pointsDeduction: parseInt(newPunishment.pointsDeduction),
      duration: newPunishment.duration,
      severity: newPunishment.severity,
      icon: '⚠️',
    };

    setShowCreateModal(false);
    handleApplyPunishment(customPunishment);
    
    // Reset form
    setNewPunishment({
      name: '',
      description: '',
      pointsDeduction: '',
      duration: '',
      severity: 'light',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'light': return '#F59E0B';
      case 'medium': return '#EF4444';
      case 'severe': return '#991B1B';
      default: return theme.colors.warning;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'light': return 'Légère';
      case 'medium': return 'Moyenne';
      case 'severe': return 'Sévère';
      default: return 'Légère';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          Gestion des punitions
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Child Selector */}
      <View style={styles.childSelector}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Sélectionner un enfant
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childOption,
                {
                  backgroundColor: selectedChild?.id === child.id
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: selectedChild?.id === child.id
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text style={styles.childAvatar}>{child.avatar || '👦'}</Text>
              <Text
                style={[
                  styles.childName,
                  {
                    color: selectedChild?.id === child.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {child.firstName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Punishments List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Punitions disponibles
        </Text>

        {['light', 'medium', 'severe'].map((severity) => (
          <View key={severity} style={styles.severitySection}>
            <View style={styles.severityHeader}>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(severity) }
              ]}>
                <Text style={styles.severityBadgeText}>
                  {getSeverityLabel(severity)}
                </Text>
              </View>
            </View>

            <View style={styles.punishmentsGrid}>
              {predefinedPunishments
                .filter(p => p.severity === severity)
                .map((punishment) => (
                  <TouchableOpacity
                    key={punishment.id}
                    style={[
                      styles.punishmentCard,
                      { 
                        backgroundColor: theme.colors.surface,
                        borderColor: getSeverityColor(severity),
                      }
                    ]}
                    onPress={() => handleApplyPunishment(punishment)}
                  >
                    <Text style={styles.punishmentIcon}>{punishment.icon}</Text>
                    <Text style={[styles.punishmentName, { color: theme.colors.text }]}>
                      {punishment.name}
                    </Text>
                    <Text style={[styles.punishmentDescription, { color: theme.colors.textSecondary }]}>
                      {punishment.description}
                    </Text>
                    <View style={styles.punishmentFooter}>
                      <View style={styles.pointsDeduction}>
                        <Ionicons name="remove-circle" size={14} color="#EF4444" />
                        <Text style={styles.pointsText}>-{punishment.pointsDeduction} pts</Text>
                      </View>
                      {punishment.duration && (
                        <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
                          {punishment.duration}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Custom Punishment Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Créer une punition
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Nom de la punition *"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPunishment.name}
                onChangeText={(text) => setNewPunishment(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Description *"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPunishment.description}
                onChangeText={(text) => setNewPunishment(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Points à retirer *"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPunishment.pointsDeduction}
                onChangeText={(text) => setNewPunishment(prev => ({ ...prev, pointsDeduction: text.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Durée (optionnel)"
                placeholderTextColor={theme.colors.textSecondary}
                value={newPunishment.duration}
                onChangeText={(text) => setNewPunishment(prev => ({ ...prev, duration: text }))}
              />

              <Text style={[styles.label, { color: theme.colors.text }]}>Sévérité</Text>
              <View style={styles.severityOptions}>
                {['light', 'medium', 'severe'].map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    style={[
                      styles.severityOption,
                      {
                        backgroundColor: newPunishment.severity === sev
                          ? getSeverityColor(sev)
                          : theme.colors.surface,
                        borderColor: getSeverityColor(sev),
                      }
                    ]}
                    onPress={() => setNewPunishment(prev => ({ ...prev, severity: sev as any }))}
                  >
                    <Text style={[
                      styles.severityOptionText,
                      { color: newPunishment.severity === sev ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {getSeverityLabel(sev)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateCustomPunishment}
            >
              <Text style={styles.createButtonText}>Créer et appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PIN Validation Modal */}
      <PinValidationModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingPunishment(null);
        }}
        onValidate={(isValid) => {
          setShowPinModal(false);
          if (isValid) {
            confirmPunishment();
          } else {
            Alert.alert('Erreur', 'Code PIN incorrect');
          }
        }}
        title="Validation parent requise"
        message="Entrez votre code PIN pour appliquer cette punition"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: CommonStyles.container,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: CommonStyles.header,
  backButton: CommonStyles.backButton,
  headerTitle: CommonStyles.headerTitle,
  addButton: {
    padding: 8,
  },
  childSelector: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  childOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    minWidth: 80,
  },
  childAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  childName: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  severitySection: {
    marginBottom: 24,
  },
  severityHeader: {
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  severityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  punishmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  punishmentCard: {
    width: Platform.OS === 'web' ? 'calc(33% - 7px)' : '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  punishmentIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  punishmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  punishmentDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  punishmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsDeduction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  duration: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  severityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PunishmentManagementScreen;