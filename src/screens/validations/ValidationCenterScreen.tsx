import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import { rewardsService, type RewardClaim } from '../../services/rewards.service';
import { childrenService } from '../../services/children.service';
import { usePinValidation } from '../../hooks/usePinValidation';
import Toast from 'react-native-toast-message';

interface PendingMission {
  id: string;
  childId: string;
  childName: string;
  missionName: string;
  points: number;
  completedAt: string;
  proof?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ValidationStats {
  pendingMissions: number;
  pendingRewards: number;
  totalPending: number;
  todayValidations: number;
  weekValidations: number;
}

const ValidationCenterScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'missions' | 'rewards'>('all');
  const [pendingMissions, setPendingMissions] = useState<PendingMission[]>([]);
  const [pendingRewards, setPendingRewards] = useState<RewardClaim[]>([]);
  const [stats, setStats] = useState<ValidationStats>({
    pendingMissions: 0,
    pendingRewards: 0,
    totalPending: 0,
    todayValidations: 0,
    weekValidations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks pour la validation PIN
  const { validateWithPin: validateApprove, PinModal: ApprovalPinModal } = usePinValidation({
    title: 'Validation Parent',
    message: 'Entrez votre code PIN pour approuver',
    action: 'Approuver',
  });

  const { validateWithPin: validateReject, PinModal: RejectionPinModal } = usePinValidation({
    title: 'Validation Parent',
    message: 'Entrez votre code PIN pour rejeter',
    action: 'Rejeter',
  });

  useEffect(() => {
    loadAllPendingItems();
  }, []);

  const loadAllPendingItems = async () => {
    try {
      setIsLoading(true);
      
      // Charger les missions en attente
      const missions = await loadPendingMissions();
      
      // Charger les récompenses en attente
      const rewards = await loadPendingRewards();
      
      // Calculer les statistiques
      const stats: ValidationStats = {
        pendingMissions: missions.length,
        pendingRewards: rewards.length,
        totalPending: missions.length + rewards.length,
        todayValidations: 0, // À implémenter avec l'historique
        weekValidations: 0,  // À implémenter avec l'historique
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Erreur chargement validations:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les validations',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingMissions = async (): Promise<PendingMission[]> => {
    try {
      // Récupérer toutes les missions
      const allMissions = await missionsService.getAllMissions();
      
      // Filtrer les missions complétées en attente de validation
      const pending = allMissions
        .filter(m => m.status === 'completed' && !m.isValidated)
        .map(m => ({
          id: m.id,
          childId: m.childId || '',
          childName: m.childName || 'Enfant',
          missionName: m.name,
          points: m.points,
          completedAt: m.completedAt || new Date().toISOString(),
          proof: m.proof,
          status: 'pending' as const,
        }));
      
      setPendingMissions(pending);
      return pending;
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      return [];
    }
  };

  const loadPendingRewards = async (): Promise<RewardClaim[]> => {
    try {
      const claims = await rewardsService.getRewardClaims();
      const pending = claims.filter(c => c.status === 'pending');
      setPendingRewards(pending);
      return pending;
    } catch (error) {
      console.error('Erreur chargement récompenses:', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllPendingItems();
    setIsRefreshing(false);
  };

  const handleApproveMission = (mission: PendingMission) => {
    validateApprove(async () => {
      try {
        await missionsService.validateMission(mission.id);
        Toast.show({
          type: 'success',
          text1: 'Mission validée',
          text2: `${mission.points} points attribués à ${mission.childName}`,
        });
        await loadAllPendingItems();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de valider la mission',
        });
      }
    });
  };

  const handleRejectMission = (mission: PendingMission) => {
    validateReject(async () => {
      Alert.alert(
        'Rejeter la mission',
        'La mission sera marquée comme rejetée. Continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Rejeter',
            style: 'destructive',
            onPress: async () => {
              try {
                await missionsService.rejectMission(mission.id);
                Toast.show({
                  type: 'info',
                  text1: 'Mission rejetée',
                  text2: `Mission de ${mission.childName} rejetée`,
                });
                await loadAllPendingItems();
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: 'Impossible de rejeter la mission',
                });
              }
            },
          },
        ]
      );
    });
  };

  const handleApproveReward = (reward: RewardClaim) => {
    validateApprove(async () => {
      try {
        await rewardsService.validateRewardClaim(reward.id);
        Toast.show({
          type: 'success',
          text1: 'Récompense approuvée',
          text2: `Récompense de ${reward.childName} validée`,
        });
        await loadAllPendingItems();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de valider la récompense',
        });
      }
    });
  };

  const handleRejectReward = (reward: RewardClaim) => {
    validateReject(async () => {
      Alert.alert(
        'Rejeter la récompense',
        'Les points seront remboursés. Continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Rejeter',
            style: 'destructive',
            onPress: async () => {
              try {
                await rewardsService.rejectRewardClaim(reward.id);
                Toast.show({
                  type: 'info',
                  text1: 'Récompense rejetée',
                  text2: 'Les points ont été remboursés',
                });
                await loadAllPendingItems();
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: 'Impossible de rejeter la récompense',
                });
              }
            },
          },
        ]
      );
    });
  };

  const renderMissionItem = (mission: PendingMission) => (
    <View key={mission.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {mission.missionName}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            Par {mission.childName} • {mission.points} points
          </Text>
          <Text style={[styles.cardDate, { color: theme.colors.textLight }]}>
            Complété le {new Date(mission.completedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectMission(mission)}
        >
          <Ionicons name="close" size={18} color="#EF4444" />
          <Text style={styles.rejectText}>Rejeter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveMission(mission)}
        >
          <Ionicons name="checkmark" size={18} color="#10B981" />
          <Text style={styles.approveText}>Valider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRewardItem = (reward: RewardClaim) => (
    <View key={reward.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift" size={24} color="#F59E0B" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {reward.rewardName}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            Par {reward.childName} • {reward.pointsCost} points
          </Text>
          <Text style={[styles.cardDate, { color: theme.colors.textLight }]}>
            Demandé le {new Date(reward.claimedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectReward(reward)}
        >
          <Ionicons name="close" size={18} color="#EF4444" />
          <Text style={styles.rejectText}>Rejeter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveReward(reward)}
        >
          <Ionicons name="checkmark" size={18} color="#10B981" />
          <Text style={styles.approveText}>Valider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getFilteredItems = () => {
    if (selectedTab === 'missions') return pendingMissions;
    if (selectedTab === 'rewards') return pendingRewards;
    return [...pendingMissions, ...pendingRewards];
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Chargement des validations...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {stats.totalPending}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            En attente
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats.pendingMissions}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Missions
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {stats.pendingRewards}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Récompenses
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'all' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'all' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Tout ({stats.totalPending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'missions' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('missions')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'missions' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Missions ({stats.pendingMissions})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'rewards' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('rewards')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'rewards' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Récompenses ({stats.pendingRewards})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {selectedTab !== 'rewards' && pendingMissions.map(renderMissionItem)}
        {selectedTab !== 'missions' && pendingRewards.map(renderRewardItem)}

        {getFilteredItems().length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="checkmark-done-circle-outline" 
              size={64} 
              color={theme.colors.textLight} 
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Tout est à jour !
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune validation en attente
            </Text>
          </View>
        )}
      </ScrollView>

      {/* PIN Modals */}
      <ApprovalPinModal />
      <RejectionPinModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
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
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  approveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  approveText: {
    color: '#10B981',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default ValidationCenterScreen;