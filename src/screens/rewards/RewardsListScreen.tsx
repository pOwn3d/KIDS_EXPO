import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { rewardsService, Reward, RewardClaim } from '../../services/rewards.service';
import { childrenService } from '../../services/children.service';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

interface RewardCardProps {
  reward: Reward;
  onPress?: () => void;
  onClaim?: () => void;
  onValidate?: () => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onPress, onClaim, onValidate }) => {
  const theme = useTheme();
  
  const getAvailabilityColor = () => {
    switch (reward.availability) {
      case 'available':
        return '#10B981';
      case 'claimed':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      case 'out_of_stock':
        return '#EF4444';
      default:
        return theme.colors.primary;
    }
  };

  const getAvailabilityIcon = () => {
    switch (reward.availability) {
      case 'available':
        return 'checkmark-circle';
      case 'claimed':
        return 'checkmark-done';
      case 'pending':
        return 'time';
      case 'out_of_stock':
        return 'close-circle';
      default:
        return 'gift';
    }
  };

  const getAvailabilityLabel = () => {
    switch (reward.availability) {
      case 'available':
        return 'Disponible';
      case 'claimed':
        return 'Réclamée';
      case 'pending':
        return 'En attente';
      case 'out_of_stock':
        return 'Épuisée';
      default:
        return 'Disponible';
    }
  };
  
  const getCategoryIcon = () => {
    switch (reward.category?.toLowerCase()) {
      case 'toys':
      case 'jouets':
        return '🧸';
      case 'books':
      case 'livres':
        return '📚';
      case 'games':
      case 'jeux':
        return '🎮';
      case 'activities':
      case 'activites':
        return '🎨';
      case 'food':
      case 'nourriture':
        return '🍿';
      case 'time':
      case 'temps':
        return '⏰';
      case 'outing':
      case 'sortie':
        return '🎯';
      default:
        return reward.icon || '🎁';
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.rewardCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rewardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
        </View>
        <View style={styles.rewardInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.rewardName, { color: theme.colors.text }]} numberOfLines={1}>
              {reward.name || 'Récompense sans nom'}
            </Text>
            <Ionicons 
              name={getAvailabilityIcon() as any} 
              size={20} 
              color={getAvailabilityColor()} 
            />
          </View>
          <View style={styles.rewardMeta}>
            <View style={[styles.categoryTag, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                {reward.category || 'Général'}
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.pointsText, { color: theme.colors.text }]}>
                {reward.pointsCost} pts
              </Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: `${getAvailabilityColor()}15` }]}>
              <Text style={[styles.statusText, { color: getAvailabilityColor() }]}>
                {getAvailabilityLabel()}
              </Text>
            </View>
          </View>
          {reward.expiryDate && (
            <View style={styles.expiryContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.expiryText, { color: theme.colors.textSecondary }]}>
                Expire le {new Date(reward.expiryDate).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {reward.availability === 'pending' && onValidate && (
        <View style={styles.validationActions}>
          <TouchableOpacity
            style={[styles.validateButton, { backgroundColor: '#10B981' }]}
            onPress={onValidate}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.validateButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {reward.availability === 'available' && onClaim && (
        <View style={styles.claimActions}>
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClaim}
          >
            <Ionicons name="gift" size={20} color="#FFFFFF" />
            <Text style={styles.claimButtonText}>Réclamer</Text>
          </TouchableOpacity>
        </View>
      )}
    </CardComponent>
  );
};

const RewardsListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardClaims, setRewardClaims] = useState<RewardClaim[]>([]);
  const [availableChildren, setAvailableChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'claimed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Récupérer l'enfant sélectionné depuis les params de navigation
  const childIdFromParams = (route.params as any)?.childId;

  useEffect(() => {
    loadChildren();
    loadRewards();
    loadRewardClaims();
  }, []);

  useEffect(() => {
    if (childIdFromParams) {
      setSelectedChildId(childIdFromParams);
    }
  }, [childIdFromParams]);

  const loadChildren = async () => {
    try {
      const children = await childrenService.getAllChildren();
      setAvailableChildren(children);
      
      // Si aucun enfant sélectionné et qu'il y a des enfants, sélectionner le premier
      if (!selectedChildId && !childIdFromParams && children.length > 0) {
        setSelectedChildId(String(children[0].id));
      }
    } catch (error) {
      console.error('Failed to load children for rewards:', error);
    }
  };

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const data = await rewardsService.getAllRewards();
      console.log('Rewards loaded from API:', data);
      setRewards(data);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      Alert.alert('Erreur', 'Impossible de charger les récompenses');
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRewardClaims = async () => {
    try {
      const claims = await rewardsService.getRewardClaims();
      setRewardClaims(claims);
    } catch (error) {
      console.error('Failed to load reward claims:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRewards(), loadRewardClaims()]);
    setRefreshing(false);
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      // Vérifier qu'un enfant est sélectionné
      if (!selectedChildId) {
        Alert.alert('Enfant manquant', 'Veuillez sélectionner un enfant pour réclamer cette récompense');
        return;
      }

      // Récupérer l'enfant sélectionné pour afficher son nom
      const selectedChild = availableChildren.find(c => String(c.id) === selectedChildId);
      const childName = selectedChild?.firstName || selectedChild?.name || 'Enfant';

      Alert.alert(
        'Confirmer la réclamation',
        `Réclamer cette récompense pour ${childName} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Réclamer', 
            style: 'default',
            onPress: async () => {
              try {
                console.log(`Claiming reward ${rewardId} for child ${selectedChildId}`);
                await rewardsService.claimReward(rewardId, selectedChildId);
                Alert.alert('Succès', `Récompense réclamée avec succès pour ${childName}`);
                await handleRefresh();
              } catch (error: any) {
                console.error('Failed to claim reward:', error);
                Alert.alert('Erreur', error.message || 'Impossible de réclamer la récompense');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to prepare reward claim:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleValidateRewardClaim = async (claimId: string) => {
    try {
      await rewardsService.validateRewardClaim(claimId);
      Alert.alert('Succès', 'Demande validée avec succès');
      await handleRefresh();
    } catch (error) {
      console.error('Failed to validate reward claim:', error);
      Alert.alert('Erreur', 'Impossible de valider la demande');
    }
  };

  const handleCreateReward = () => {
    navigation.navigate('CreateReward' as never);
  };

  const filteredRewards = useMemo(() => {
    return rewards.filter(reward => {
      // Filtre par statut
      let statusMatch = true;
      if (filter === 'available') statusMatch = reward.availability === 'available';
      else if (filter === 'pending') statusMatch = reward.availability === 'pending';
      else if (filter === 'claimed') statusMatch = reward.availability === 'claimed';
      
      // Filtre par recherche
      let searchMatch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        searchMatch = reward.name.toLowerCase().includes(query) ||
                     reward.description.toLowerCase().includes(query) ||
                     reward.category?.toLowerCase().includes(query);
      }
      
      return statusMatch && searchMatch;
    });
  }, [rewards, filter, searchQuery]);

  const pendingCount = rewardClaims.filter(c => c.status === 'pending').length;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <WebScreenWrapper
      title="Récompenses"
      subtitle="Gérez les récompenses et validez les demandes"
      icon="gift"
      headerProps={{ notificationCount: pendingCount }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher une récompense..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        {[
          { key: 'all', label: 'Toutes', count: rewards.length },
          { key: 'available', label: 'Disponibles', count: rewards.filter(r => r.availability === 'available').length },
          { key: 'pending', label: 'En attente', count: pendingCount },
          { key: 'claimed', label: 'Réclamées', count: rewards.filter(r => r.availability === 'claimed').length },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
                { backgroundColor: isActive ? theme.colors.primary : theme.colors.surface }
              ]}
              onPress={() => {
                console.log('Filter tab pressed:', tab.key);
                setFilter(tab.key as any);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterTabText,
                { color: isActive ? '#FFFFFF' : theme.colors.text }
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.filterBadge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : theme.colors.primary }
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    { color: isActive ? '#FFFFFF' : '#FFFFFF' }
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Rewards List */}
      <ScrollView
        style={styles.rewardsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filteredRewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune récompense trouvée
            </Text>
          </View>
        ) : (
          filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onPress={undefined}
              onClaim={reward.availability === 'available' 
                ? () => handleClaimReward(reward.id)
                : undefined
              }
              onValidate={reward.availability === 'pending' 
                ? () => {
                  // Trouver la demande correspondante
                  const claim = rewardClaims.find(c => c.rewardId === reward.id && c.status === 'pending');
                  if (claim) {
                    handleValidateRewardClaim(claim.id);
                  }
                }
                : undefined
              }
            />
          ))
        )}
      </ScrollView>
      </SafeAreaView>
    </WebScreenWrapper>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'web' ? 30 : 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 20,
    flexDirection: 'row',
    maxHeight: 50,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardsList: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  rewardCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  rewardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
  },
  validationActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  claimActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default RewardsListScreen;