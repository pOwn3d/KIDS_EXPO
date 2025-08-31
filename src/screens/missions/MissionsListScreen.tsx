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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';

interface Mission {
  id: string;
  name: string;
  description: string;
  points: number;
  status: 'active' | 'completed' | 'pending_validation' | 'failed' | 'inactive';
  type: 'daily' | 'weekly' | 'monthly' | 'once';
  assignedTo: string[];
  dueDate?: string;
  completedAt?: string;
  category?: string;
}

interface MissionCardProps {
  mission: Mission;
  onPress: () => void;
  onValidate?: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onPress, onValidate }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (mission.status) {
      case 'completed':
        return '#10B981';
      case 'pending_validation':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'inactive':
        return '#9CA3AF';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = () => {
    switch (mission.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending_validation':
        return 'time';
      case 'failed':
        return 'close-circle';
      case 'inactive':
        return 'pause-circle';
      default:
        return 'play-circle';
    }
  };

  const getTypeLabel = () => {
    switch (mission.type) {
      case 'daily':
        return 'Quotidienne';
      case 'weekly':
        return 'Hebdomadaire';
      case 'monthly':
        return 'Mensuelle';
      default:
        return 'Ponctuelle';
    }
  };
  
  const getCategoryIcon = () => {
    switch (mission.category) {
      case 'chores':
      case 'taches':
        return '🧹';
      case 'homework':
      case 'devoirs':
        return '📚';
      case 'behavior':
      case 'comportement':
        return '😊';
      case 'sport':
        return '⚽';
      case 'reading':
      case 'lecture':
        return '📖';
      default:
        return '🎯';
    }
  };
  
  const getDifficultyColor = () => {
    const difficulty = mission.category?.toLowerCase();
    if (difficulty === 'easy' || difficulty === 'facile') return '#10B981';
    if (difficulty === 'medium' || difficulty === 'moyen') return '#F59E0B';
    if (difficulty === 'hard' || difficulty === 'difficile') return '#EF4444';
    return theme.colors.primary;
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.missionCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.missionHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
        </View>
        <View style={styles.missionInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.missionName, { color: theme.colors.text }]} numberOfLines={1}>
              {mission.name || 'Mission sans nom'}
            </Text>
            <Ionicons 
              name={getStatusIcon() as any} 
              size={20} 
              color={getStatusColor()} 
            />
          </View>
          <View style={styles.missionMeta}>
            <View style={[styles.typeTag, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.typeText, { color: theme.colors.primary }]}>
                {getTypeLabel()}
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.pointsText, { color: theme.colors.text }]}>
                {mission.points} pts
              </Text>
            </View>
            {mission.dueDate && (
              <View style={styles.dueDateContainer}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.dueDateText, { color: theme.colors.textSecondary }]}>
                  {new Date(mission.dueDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {mission.status === 'pending_validation' && onValidate && (
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
    </CardComponent>
  );
};

const MissionsListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const data = await missionsService.getAllMissions();
      console.log('Missions loaded from API:', data);
      setMissions(data);
    } catch (error) {
      console.error('Failed to load missions:', error);
      Alert.alert('Erreur', 'Impossible de charger les missions');
      setMissions([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMissions();
  };

  const handleValidateMission = async (missionId: string) => {
    try {
      await missionsService.validateMission(missionId);
      Alert.alert('Succès', 'Mission validée avec succès');
      loadMissions();
    } catch (error) {
      console.error('Failed to validate mission:', error);
      Alert.alert('Erreur', 'Impossible de valider la mission');
    }
  };

  const handleCreateMission = () => {
    navigation.navigate('CreateMission' as never);
  };

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      // Filtre par statut
      let statusMatch = true;
      if (filter === 'active') statusMatch = mission.status === 'active';
      else if (filter === 'pending') statusMatch = mission.status === 'pending_validation';
      else if (filter === 'completed') statusMatch = mission.status === 'completed';
      
      // Filtre par recherche
      let searchMatch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        searchMatch = mission.name.toLowerCase().includes(query) ||
                     mission.description.toLowerCase().includes(query) ||
                     mission.category?.toLowerCase().includes(query);
      }
      
      return statusMatch && searchMatch;
    });
  }, [missions, filter, searchQuery]);

  const pendingCount = missions.filter(m => m.status === 'pending_validation').length;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header - Masqué sur Web car déjà fourni par la navigation */}
      {Platform.OS !== 'web' && (
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Missions
            </Text>
            {pendingCount > 0 && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {pendingCount} mission{pendingCount > 1 ? 's' : ''} en attente de validation
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateMission}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher une mission..."
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
      >
        {[
          { key: 'all', label: 'Toutes', count: missions.length },
          { key: 'active', label: 'Actives', count: missions.filter(m => m.status === 'active').length },
          { key: 'pending', label: 'En attente', count: pendingCount },
          { key: 'completed', label: 'Terminées', count: missions.filter(m => m.status === 'completed').length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && { backgroundColor: theme.colors.primary },
              filter !== tab.key && { backgroundColor: theme.colors.surface }
            ]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              filter === tab.key ? { color: '#FFFFFF' } : { color: theme.colors.text }
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.filterBadge,
                filter === tab.key 
                  ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                  : { backgroundColor: `${theme.colors.primary}20` }
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  filter === tab.key ? { color: '#FFFFFF' } : { color: theme.colors.primary }
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Missions List */}
      <ScrollView
        style={styles.missionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filteredMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune mission trouvée
            </Text>
          </View>
        ) : (
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onPress={undefined}
              onValidate={mission.status === 'pending_validation' 
                ? () => handleValidateMission(mission.id)
                : undefined
              }
            />
          ))
        )}
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
  missionsList: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  missionCard: {
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
  missionHeader: {
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
  missionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  missionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  missionDescription: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  missionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
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
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dueDateText: {
    fontSize: 12,
  },
  validationActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default MissionsListScreen;