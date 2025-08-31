import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { 
  leaderboardService, 
  type LeaderboardEntry, 
  type LeaderboardStats,
  type LeaderboardPeriod,
  type LeaderboardCategory 
} from '../../services/leaderboard.service';

const LeaderboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topThree, setTopThree] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('all-time');
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('points');

  const periods: Array<{ value: LeaderboardPeriod; label: string; icon: string }> = [
    { value: 'daily', label: 'Aujourd\'hui', icon: 'today' },
    { value: 'weekly', label: 'Semaine', icon: 'calendar' },
    { value: 'monthly', label: 'Mois', icon: 'calendar-outline' },
    { value: 'all-time', label: 'Tout temps', icon: 'trophy' },
  ];

  const categories: Array<{ value: LeaderboardCategory; label: string; icon: string }> = [
    { value: 'points', label: 'Points', icon: 'star' },
    { value: 'missions', label: 'Missions', icon: 'checkmark-circle' },
    { value: 'streak', label: 'Série', icon: 'flame' },
    { value: 'level', label: 'Niveau', icon: 'trending-up' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedCategory]);

  const loadLeaderboard = async () => {
    try {
      console.log('🏆 Chargement du classement...');
      const [leaderboardData, statsData] = await Promise.all([
        leaderboardService.getLeaderboard(selectedPeriod, selectedCategory),
        leaderboardService.getLeaderboardStats(),
      ]);

      console.log('📊 Données classement:', leaderboardData);
      setLeaderboard(leaderboardData);
      setTopThree(leaderboardData.slice(0, 3));
      setStats(statsData);
    } catch (error) {
      console.error('❌ Erreur chargement classement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Or
      case 2: return '#C0C0C0'; // Argent
      case 3: return '#CD7F32'; // Bronze
      default: return theme.colors.textSecondary;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getChangeIcon = (change?: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up': return { name: 'arrow-up', color: '#10B981' };
      case 'down': return { name: 'arrow-down', color: '#EF4444' };
      default: return { name: 'remove', color: theme.colors.textSecondary };
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (selectedCategory) {
      case 'missions': return `${entry.missionsCompleted} missions`;
      case 'streak': return `${entry.streak} jours`;
      case 'level': return `Niveau ${entry.level}`;
      case 'points':
      default: return `${entry.points} pts`;
    }
  };

  const PeriodSelector: React.FC = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.periodSelector}
      contentContainerStyle={styles.periodSelectorContent}
    >
      {periods.map((period) => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period.value 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: selectedPeriod === period.value 
                ? theme.colors.primary 
                : theme.colors.border,
            },
          ]}
          onPress={() => setSelectedPeriod(period.value)}
        >
          <Ionicons 
            name={period.icon as any} 
            size={16} 
            color={selectedPeriod === period.value ? '#FFFFFF' : theme.colors.text} 
          />
          <Text
            style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period.value ? '#FFFFFF' : theme.colors.text,
              },
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const CategorySelector: React.FC = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categorySelector}
      contentContainerStyle={styles.categorySelectorContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory === category.value 
                ? `${theme.colors.primary}20` 
                : 'transparent',
            },
          ]}
          onPress={() => setSelectedCategory(category.value)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={selectedCategory === category.value ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <Text
            style={[
              styles.categoryButtonText,
              {
                color: selectedCategory === category.value ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: selectedCategory === category.value ? '600' : 'normal',
              },
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const TopThreePodium: React.FC = () => {
    if (topThree.length === 0) return null;

    const podiumOrder = [
      topThree[1], // 2ème place (gauche)
      topThree[0], // 1ère place (centre)
      topThree[2], // 3ème place (droite)
    ].filter(Boolean);

    return (
      <View style={[styles.podiumContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.podiumTitle, { color: theme.colors.text }]}>
          Top 3 🏆
        </Text>
        <View style={styles.podium}>
          {podiumOrder.map((entry, index) => {
            if (!entry) return <View key={index} style={styles.podiumPlace} />;
            
            const actualRank = entry.rank;
            const isFirst = actualRank === 1;
            
            return (
              <View 
                key={entry.id} 
                style={[
                  styles.podiumPlace, 
                  isFirst && styles.firstPlace
                ]}
              >
                <View style={[
                  styles.podiumAvatar,
                  { borderColor: getRankColor(actualRank) }
                ]}>
                  <Text style={styles.podiumAvatarText}>{entry.avatar}</Text>
                  <View style={[
                    styles.rankBadge,
                    { backgroundColor: getRankColor(actualRank) }
                  ]}>
                    <Text style={styles.rankBadgeText}>{getRankIcon(actualRank)}</Text>
                  </View>
                </View>
                <Text style={[styles.podiumName, { color: theme.colors.text }]}>
                  {entry.childName}
                </Text>
                <Text style={[styles.podiumPoints, { color: theme.colors.primary }]}>
                  {getCategoryValue(entry)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const LeaderboardItem: React.FC<{ entry: LeaderboardEntry; index: number }> = ({ entry, index }) => {
    const changeIcon = getChangeIcon(entry.change);
    const isTopThree = entry.rank <= 3;

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          { 
            backgroundColor: theme.colors.surface,
            borderLeftColor: isTopThree ? getRankColor(entry.rank) : 'transparent',
            borderLeftWidth: isTopThree ? 4 : 0,
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <Text style={styles.rankIcon}>{getRankIcon(entry.rank)}</Text>
          ) : (
            <Text style={[styles.rankNumber, { color: theme.colors.text }]}>
              {entry.rank}
            </Text>
          )}
        </View>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{entry.avatar}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.childName, { color: theme.colors.text }]}>
            {entry.childName}
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              Niveau {entry.level}
            </Text>
            {entry.badges > 0 && (
              <>
                <Text style={[styles.statSeparator, { color: theme.colors.textSecondary }]}>•</Text>
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  {entry.badges} badges
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>
            {getCategoryValue(entry)}
          </Text>
          <View style={styles.changeIndicator}>
            <Ionicons 
              name={changeIcon.name as any} 
              size={16} 
              color={changeIcon.color} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const StatsCard: React.FC = () => {
    if (!stats) return null;

    return (
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
          Statistiques 📊
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.totalChildren}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Participants
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.averagePoints}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Points moyens
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>
              {stats.topPerformer}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Champion
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {stats.mostImproved}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Plus amélioré
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement du classement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Classement
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Comparez les performances de vos enfants
        </Text>
      </View>

      {/* Selectors */}
      <PeriodSelector />
      <CategorySelector />

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Podium pour le top 3 */}
        <TopThreePodium />

        {/* Statistiques */}
        <StatsCard />

        {/* Liste du classement */}
        <View style={styles.leaderboardList}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>
            Classement complet
          </Text>
          {leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Aucune donnée
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
                Le classement apparaîtra quand les enfants auront gagné des points
              </Text>
            </View>
          ) : (
            leaderboard.map((entry, index) => (
              <LeaderboardItem key={entry.id} entry={entry} index={index} />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    fontSize: 16,
  },
  header: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  periodSelector: {
    maxHeight: 60,
  },
  periodSelectorContent: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 10,
    gap: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  categorySelector: {
    maxHeight: 50,
  },
  categorySelectorContent: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryButtonText: {
    fontSize: 14,
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  podiumContainer: {
    margin: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  podiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  podiumPlace: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 100,
  },
  firstPlace: {
    marginBottom: 20,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  podiumAvatarText: {
    fontSize: 28,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 14,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsCard: {
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  leaderboardList: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginHorizontal: 12,
  },
  avatar: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
  },
  statSeparator: {
    marginHorizontal: 6,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeIndicator: {
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomPadding: {
    height: 40,
  },
});

export default LeaderboardScreen;