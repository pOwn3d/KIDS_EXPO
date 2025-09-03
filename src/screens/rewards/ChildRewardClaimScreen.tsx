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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { rewardsService } from '../../services/rewards.service';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/store';
import { AppSpacing, CommonStyles } from '../../constants/spacing';

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  category?: string;
  icon?: string;
  quantity?: number;
  isActive?: boolean;
}

const ChildRewardClaimScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const currentUser = useSelector(selectCurrentUser);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myPoints, setMyPoints] = useState(500); // TODO: Récupérer les vrais points
  const [filter, setFilter] = useState<'all' | 'affordable' | 'favorite'>('all');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const allRewards = await rewardsService.getAllRewards();
      // Filtrer les récompenses actives
      const activeRewards = allRewards.filter(r => r.isActive !== false);
      setRewards(activeRewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      Alert.alert('Erreur', 'Impossible de charger les récompenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (reward: Reward) => {
    if (reward.pointsCost > myPoints) {
      Alert.alert(
        'Points insuffisants',
        `Il te manque ${reward.pointsCost - myPoints} points pour cette récompense.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Réclamer cette récompense ?',
      `${reward.name}\n\nCoût: ${reward.pointsCost} points\nTes points après: ${myPoints - reward.pointsCost} points`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réclamer',
          onPress: async () => {
            try {
              // TODO: Appeler l'API pour créer la demande de récompense
              Alert.alert(
                'Succès',
                'Ta demande a été envoyée à tes parents pour validation !',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de réclamer la récompense');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      toy: '🎮',
      outing: '🎢',
      privilege: '⭐',
      gift: '🎁',
      treat: '🍭',
      'screen-time': '📱',
      special: '✨',
      other: '🎯',
    };
    return icons[category || 'other'] || '🎯';
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'affordable') return reward.pointsCost <= myPoints;
    if (filter === 'favorite') return false; // TODO: Implémenter les favoris
    return true;
  });

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
          Boutique de récompenses
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Points Banner */}
      <View style={[styles.pointsBanner, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsLabel}>Mes points</Text>
          <View style={styles.pointsValueContainer}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.pointsValue}>{myPoints}</Text>
          </View>
        </View>
        <View style={styles.pointsDecoration}>
          <Ionicons name="trophy" size={40} color="rgba(255,255,255,0.2)" />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: 'all', label: 'Toutes', icon: 'grid' },
          { key: 'affordable', label: 'Accessibles', icon: 'checkmark-circle' },
          { key: 'favorite', label: 'Favoris', icon: 'heart' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
              filter !== tab.key && { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={filter === tab.key ? '#FFFFFF' : theme.colors.text} 
            />
            <Text style={[
              styles.filterTabText,
              filter === tab.key ? { color: '#FFFFFF' } : { color: theme.colors.text }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rewards Grid */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rewardsGrid}>
          {filteredRewards.map((reward) => {
            const isAffordable = reward.pointsCost <= myPoints;
            
            return (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.rewardCard,
                  {
                    backgroundColor: theme.colors.surface,
                    opacity: isAffordable ? 1 : 0.7,
                  }
                ]}
                onPress={() => handleClaimReward(reward)}
                disabled={!isAffordable}
              >
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>
                    {getCategoryIcon(reward.category)}
                  </Text>
                  {!isAffordable && (
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={16} color="#EF4444" />
                    </View>
                  )}
                </View>

                <Text style={[styles.rewardName, { color: theme.colors.text }]} numberOfLines={2}>
                  {reward.name}
                </Text>

                <Text style={[styles.rewardDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {reward.description}
                </Text>

                <View style={styles.rewardFooter}>
                  <View style={[
                    styles.costContainer,
                    { backgroundColor: isAffordable ? '#10B98120' : '#EF444420' }
                  ]}>
                    <Ionicons 
                      name="star" 
                      size={14} 
                      color={isAffordable ? '#10B981' : '#EF4444'} 
                    />
                    <Text style={[
                      styles.costText,
                      { color: isAffordable ? '#10B981' : '#EF4444' }
                    ]}>
                      {reward.pointsCost}
                    </Text>
                  </View>

                  {isAffordable && (
                    <TouchableOpacity
                      style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleClaimReward(reward)}
                    >
                      <Ionicons name="cart" size={14} color="#FFFFFF" />
                      <Text style={styles.claimButtonText}>Obtenir</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {reward.quantity !== undefined && reward.quantity !== null && (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>Stock: {reward.quantity}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredRewards.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune récompense disponible
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  pointsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  pointsDecoration: {
    position: 'absolute',
    right: 16,
    opacity: 0.3,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    gap: 6,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  rewardCard: {
    width: Platform.OS === 'web' ? 'calc(33% - 7px)' : '47%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 40,
  },
  lockedBadge: {
    backgroundColor: '#EF444420',
    padding: 4,
    borderRadius: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  bottomPadding: CommonStyles.bottomPadding,
});

export default ChildRewardClaimScreen;