import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import type { Mission } from '../../services/missions.service';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

const MissionsHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'toutes' | 'actives' | 'terminees'>('toutes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      console.log('📋 Chargement des missions...');
      const allMissions = await missionsService.getAllMissions();
      console.log('✅ Missions chargées:', allMissions.length);
      setMissions(allMissions);
    } catch (error: any) {
      console.error('❌ Erreur chargement missions:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les missions. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMissions();
    setIsRefreshing(false);
  };

  const handleCreateMission = () => {
    navigation.navigate('CreateMission' as never);
  };

  const handleMissionPress = (mission: Mission) => {
    navigation.navigate('MissionDetail' as never, { missionId: mission.id } as never);
  };

  const handleDeleteMission = (mission: Mission) => {
    Alert.alert(
      'Supprimer la mission',
      `Êtes-vous sûr de vouloir supprimer la mission "${mission.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteMission(mission.id),
        },
      ]
    );
  };

  const deleteMission = async (missionId: string) => {
    try {
      await missionsService.deleteMission(missionId);
      await loadMissions(); // Recharger la liste
      Alert.alert('Succès', 'Mission supprimée avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de supprimer la mission');
    }
  };

  const getFilteredMissions = () => {
    let filtered = missions;
    
    // Filtre par statut
    switch (activeTab) {
      case 'actives':
        filtered = filtered.filter(m => m.status === 'active');
        break;
      case 'terminees':
        filtered = filtered.filter(m => m.status === 'completed');
        break;
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.type?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getMissionIcon = (category: string) => {
    const icons: Record<string, string> = {
      menage: '🧹',
      devoirs: '📚',
      sport: '⚽',
      creativite: '🎨',
      lecture: '📖',
      aide: '🤝',
      responsabilite: '⭐',
      general: '🎯',
    };
    return icons[category] || '🎯';
  };

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case 'daily': return '#FF6B6B';
      case 'weekly': return '#4ECDC4';
      case 'monthly': return '#45B7D1';
      default: return '#96CEB4';
    }
  };

  const getDifficultyLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Quotidienne';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuelle';
      default: return 'Ponctuelle';
    }
  };

  const TabButton: React.FC<{
    title: string;
    isActive: boolean;
    onPress: () => void;
    count: number;
  }> = ({ title, isActive, onPress, count }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          borderBottomWidth: isActive ? 0 : 1,
          borderBottomColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color: isActive ? '#FFFFFF' : theme.colors.text,
            fontWeight: isActive ? '600' : 'normal',
          },
        ]}
      >
        {title}
      </Text>
      {count > 0 && (
        <View style={[styles.tabBadge, { backgroundColor: isActive ? '#FFFFFF20' : theme.colors.primary }]}>
          <Text style={[styles.tabBadgeText, { color: isActive ? '#FFFFFF' : '#FFFFFF' }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => (
    <TouchableOpacity
      style={[styles.missionCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleMissionPress(mission)}
      activeOpacity={0.7}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionIconContainer}>
          <Text style={styles.missionIcon}>{getMissionIcon(mission.category || 'general')}</Text>
        </View>
        <View style={styles.missionInfo}>
          <Text style={[styles.missionTitle, { color: theme.colors.text }]}>
            {mission.name}
          </Text>
          <Text style={[styles.missionDescription, { color: theme.colors.textSecondary }]}>
            {mission.description}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteMission(mission);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.missionFooter}>
        <View style={styles.missionPoints}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.pointsText, { color: theme.colors.text }]}>
            {mission.points} points
          </Text>
        </View>
        
        <View style={[styles.typeBadge, { backgroundColor: getDifficultyColor(mission.type) }]}>
          <Text style={styles.typeBadgeText}>
            {getDifficultyLabel(mission.type)}
          </Text>
        </View>

        <View style={[styles.statusBadge, {
          backgroundColor: mission.status === 'active' ? '#10B981' : mission.status === 'completed' ? '#3B82F6' : '#6B7280'
        }]}>
          <Text style={styles.statusBadgeText}>
            {mission.status === 'active' ? 'Active' : mission.status === 'completed' ? 'Terminée' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des missions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredMissions = getFilteredMissions();
  const activeMissionsCount = missions.filter(m => m.status === 'active').length;
  const completedMissionsCount = missions.filter(m => m.status === 'completed').length;

  return (
    <WebScreenWrapper
      title="Missions"
      subtitle="Gérez et suivez les missions de vos enfants"
      icon="list"
      headerProps={{ notificationCount: 2 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
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

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <TabButton
            title="Toutes"
            isActive={activeTab === 'toutes'}
            onPress={() => setActiveTab('toutes')}
            count={missions.length}
          />
          <TabButton
            title="Actives"
            isActive={activeTab === 'actives'}
            onPress={() => setActiveTab('actives')}
            count={activeMissionsCount}
          />
          <TabButton
            title="Terminées"
            isActive={activeTab === 'terminees'}
            onPress={() => setActiveTab('terminees')}
            count={completedMissionsCount}
          />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredMissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Aucune mission
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              {activeTab === 'toutes'
                ? 'Créez votre première mission pour motiver vos enfants'
                : activeTab === 'actives'
                ? 'Aucune mission active pour le moment'
                : 'Aucune mission terminée pour le moment'
              }
            </Text>
            {activeTab === 'toutes' && (
              <TouchableOpacity
                style={[styles.createMissionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateMission}
              >
                <Text style={styles.createMissionButtonText}>
                  Créer une mission
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.missionsList}>
            {filteredMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </View>
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
  searchContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 5 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabsScroll: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createMissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createMissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  missionsList: {
    padding: Platform.OS === 'web' ? 40 : 20,
  },
  missionCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionIcon: {
    fontSize: 24,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MissionsHomeScreen;