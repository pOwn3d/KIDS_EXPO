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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import PinValidationModal from '../../components/auth/PinValidationModal';
import { AppSpacing, CommonStyles } from '../../constants/spacing';
import { useParentAccess } from '../../hooks/useParentAccess';

interface PendingMission {
  id: string | number;
  childName: string;
  childAvatar: string;
  missionName: string;
  missionDescription: string;
  points: number;
  completedAt: string;
  evidence?: string;
  status: 'pending_validation' | 'completed';
}

const MissionValidationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { hasParentAccess } = useParentAccess();
  const [pendingMissions, setPendingMissions] = useState<PendingMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<PendingMission | null>(null);
  const [validationAction, setValidationAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadPendingMissions();
  }, []);

  const loadPendingMissions = async () => {
    try {
      setIsLoading(true);
      // Charger les missions en attente de validation
      const missions = await missionsService.getAllMissions({ status: 'completed' as any });
      
      // Transformer les données pour l'affichage
      const pending = missions.map(m => ({
        id: m.id,
        childName: m.childName || 'Enfant',
        childAvatar: '👦',
        missionName: m.name || m.title || 'Mission',
        missionDescription: m.description || '',
        points: m.pointsReward || m.points || 0,
        completedAt: m.completedAt || new Date().toISOString(),
        status: 'pending_validation' as const,
      }));
      
      setPendingMissions(pending);
    } catch (error) {
      console.error('Failed to load pending missions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingMissions();
  };

  const handleValidation = async (mission: PendingMission, action: 'approve' | 'reject') => {
    setSelectedMission(mission);
    setValidationAction(action);
    
    // Si on a déjà l'accès parent (parent connecté ou session PIN active), 
    // ne pas redemander le PIN
    if (hasParentAccess) {
      // Validation directe sans PIN
      await performValidation(mission, action);
    } else {
      // Sinon, demander le PIN
      setShowPinModal(true);
    }
  };

  const performValidation = async (mission: PendingMission, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await missionsService.validateMission(Number(mission.id));
        Alert.alert(
          'Mission validée',
          `${mission.childName} a gagné ${mission.points} points !`,
          [{ text: 'OK' }]
        );
      } else {
        await missionsService.rejectMission(Number(mission.id), 'Rejeté par le parent');
        Alert.alert(
          'Mission rejetée',
          'La mission a été rejetée. L\'enfant devra la refaire.',
          [{ text: 'OK' }]
        );
      }

      // Recharger la liste
      loadPendingMissions();
      setSelectedMission(null);
      setValidationAction(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider la mission');
    }
  };

  const confirmValidation = async () => {
    if (!selectedMission || !validationAction) return;
    await performValidation(selectedMission, validationAction);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Il y a moins d\'une heure';
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    
    return date.toLocaleDateString('fr-FR');
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
      <View style={[styles.header, { backgroundColor: Platform.OS === 'web' ? 'transparent' : theme.colors.surface }]}>
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Missions à valider
        </Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{pendingMissions.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {pendingMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.success} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Tout est validé !
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune mission en attente de validation
            </Text>
          </View>
        ) : (
          <View style={styles.missionsList}>
            {pendingMissions.map((mission) => (
              <View
                key={mission.id}
                style={[styles.missionCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.missionHeader}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childAvatar}>{mission.childAvatar}</Text>
                    <View>
                      <Text style={[styles.childName, { color: theme.colors.text }]}>
                        {mission.childName}
                      </Text>
                      <Text style={[styles.completedTime, { color: theme.colors.textSecondary }]}>
                        {formatDate(mission.completedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.pointsBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Ionicons name="star" size={16} color={theme.colors.primary} />
                    <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
                      {mission.points}
                    </Text>
                  </View>
                </View>

                <View style={styles.missionContent}>
                  <Text style={[styles.missionName, { color: theme.colors.text }]}>
                    {mission.missionName}
                  </Text>
                  <Text style={[styles.missionDescription, { color: theme.colors.textSecondary }]}>
                    {mission.missionDescription}
                  </Text>
                </View>

                {mission.evidence && (
                  <View style={[styles.evidenceContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
                    <Ionicons name="attach" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.evidenceText, { color: theme.colors.textSecondary }]}>
                      Preuve fournie
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.rejectButton, { borderColor: '#EF4444' }]}
                    onPress={() => handleValidation(mission, 'reject')}
                  >
                    <Ionicons name="close" size={20} color="#EF4444" />
                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.approveButton, { backgroundColor: '#10B981' }]}
                    onPress={() => handleValidation(mission, 'approve')}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* PIN Validation Modal */}
      <PinValidationModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setSelectedMission(null);
          setValidationAction(null);
        }}
        onValidate={(isValid) => {
          setShowPinModal(false);
          if (isValid) {
            confirmValidation();
          } else {
            Alert.alert('Erreur', 'Code PIN incorrect');
          }
        }}
        title="Validation parent"
        message={`Confirmez-vous ${validationAction === 'approve' ? 'valider' : 'rejeter'} cette mission ?`}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 20,
  },
  backButton: CommonStyles.backButton,
  headerTitle: {
    ...CommonStyles.headerTitle,
    flex: 1,
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
  },
  missionsList: {
    gap: 12,
    paddingBottom: 20,
  },
  missionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatar: {
    fontSize: 32,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedTime: {
    fontSize: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  missionContent: {
    marginBottom: 12,
  },
  missionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  evidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  evidenceText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MissionValidationScreen;