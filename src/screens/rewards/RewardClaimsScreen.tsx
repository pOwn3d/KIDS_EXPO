import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useRewards } from '../../hooks';
import { usePinValidation } from '../../hooks/usePinValidation';
import Toast from 'react-native-toast-message';
import { RewardClaim } from '../../types/api/rewards';

const RewardClaimsScreen: React.FC = () => {
  const theme = useTheme();
  const {
    rewardClaims,
    isLoading,
    error,
    fetchRewardClaims,
    validateClaim,
    rejectClaim,
    clearError,
  } = useRewards();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Hook pour la validation PIN
  const { validateWithPin: validateApprove, PinModal: ApprovalPinModal } = usePinValidation({
    title: 'Validation Requise',
    message: 'Entrez votre code PIN pour approuver cette récompense',
    action: 'Approuver',
  });

  const { validateWithPin: validateReject, PinModal: RejectionPinModal } = usePinValidation({
    title: 'Validation Requise',
    message: 'Entrez votre code PIN pour rejeter cette récompense',
    action: 'Rejeter',
  });

  useEffect(() => {
    fetchRewardClaims();
  }, [fetchRewardClaims]);

  const loadClaims = async () => {
    try {
      await fetchRewardClaims();
    } catch (error: any) {
      console.error('Erreur chargement demandes:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de charger les demandes',
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchRewardClaims();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = (claim: RewardClaim) => {
    validateApprove(async () => {
      try {
        await validateClaim(claim.id).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Récompense approuvée',
          text2: `La récompense de ${claim.childName} a été validée`,
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: error.message || 'Impossible de valider la récompense',
        });
      }
    });
  };

  const handleReject = (claim: RewardClaim) => {
    validateReject(async () => {
      Alert.alert(
        'Confirmer le rejet',
        'Les points seront remboursés à l\'enfant. Continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Rejeter',
            style: 'destructive',
            onPress: async () => {
              try {
                await rejectClaim(claim.id, 'Rejeté par le parent').unwrap();
                Toast.show({
                  type: 'info',
                  text1: 'Récompense rejetée',
                  text2: 'Les points ont été remboursés',
                });
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: error.message || 'Impossible de rejeter la récompense',
                });
              }
            },
          },
        ]
      );
    });
  };

  const filteredClaims = rewardClaims.filter(claim => claim.status === selectedTab);

  const renderClaim = ({ item }: { item: RewardClaim }) => (
    <View style={[styles.claimCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.claimHeader}>
        <View style={styles.claimInfo}>
          <Text style={[styles.childName, { color: theme.colors.text }]}>
            {item.childName}
          </Text>
          <Text style={[styles.rewardName, { color: theme.colors.textSecondary }]}>
            {item.rewardName}
          </Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={[styles.pointsText, { color: theme.colors.primary }]}>
            {item.pointsCost} pts
          </Text>
        </View>
      </View>

      <View style={styles.claimMeta}>
        <Text style={[styles.claimDate, { color: theme.colors.textLight }]}>
          Demandé le {new Date(item.claimedAt).toLocaleDateString('fr-FR')}
        </Text>
        {item.validatedAt && (
          <Text style={[styles.claimDate, { color: theme.colors.textLight }]}>
            Validé le {new Date(item.validatedAt).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item)}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.rejectText}>Rejeter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.approveText}>Approuver</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'approved' && (
        <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[styles.statusText, { color: '#10B981' }]}>Approuvée</Text>
        </View>
      )}

      {item.status === 'rejected' && (
        <View style={[styles.statusBadge, { backgroundColor: '#EF444420' }]}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text style={[styles.statusText, { color: '#EF4444' }]}>Rejetée</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'pending' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'pending' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            En attente ({rewardClaims.filter(c => c.status === 'pending').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'approved' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('approved')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'approved' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Approuvées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'rejected' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setSelectedTab('rejected')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'rejected' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Rejetées
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredClaims}
        renderItem={renderClaim}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color={theme.colors.textLight} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune demande {selectedTab === 'pending' ? 'en attente' : selectedTab === 'approved' ? 'approuvée' : 'rejetée'}
            </Text>
          </View>
        }
      />

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
  list: {
    padding: 16,
  },
  claimCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardName: {
    fontSize: 14,
  },
  pointsBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  claimMeta: {
    marginBottom: 12,
  },
  claimDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  actions: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default RewardClaimsScreen;