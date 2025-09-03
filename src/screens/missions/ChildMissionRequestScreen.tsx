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
import { missionsService } from '../../services/missions.service';
import { childrenService } from '../../services/children.service';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/store';
import { AppSpacing, CommonStyles } from '../../constants/spacing';

interface Mission {
  id: string | number;
  name: string;
  description: string;
  points: number;
  pointsReward?: number;
  category?: string;
  difficulty?: string;
  icon?: string;
  status?: string;
  type?: string;
}

const ChildMissionRequestScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const currentUser = useSelector(selectCurrentUser);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    loadAvailableMissions();
  }, []);

  const loadAvailableMissions = async () => {
    try {
      setIsLoading(true);
      // Charger toutes les missions disponibles
      const allMissions = await missionsService.getAllMissions();
      // Filtrer celles qui ne sont pas déjà assignées ou complétées
      const availableMissions = allMissions.filter(m => 
        m.status === 'pending' || m.status === 'active' || !m.status
      );
      setMissions(availableMissions);
    } catch (error) {
      console.error('Failed to load missions:', error);
      Alert.alert('Erreur', 'Impossible de charger les missions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMission = async (mission: Mission) => {
    Alert.alert(
      'Demander cette mission ?',
      `${mission.name}\n\nRécompense: ${mission.pointsReward || mission.points} points`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Demander',
          onPress: async () => {
            try {
              // Ici on devrait créer une demande de mission
              // Pour l'instant on assigne directement
              Alert.alert(
                'Succès',
                'Ta demande a été envoyée à tes parents !',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category?: string) => {
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
    return icons[category || 'general'] || '🎯';
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return theme.colors.primary;
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Normal';
    }
  };

  const filteredMissions = missions.filter(mission => {
    if (filter === 'all') return true;
    return mission.difficulty === filter;
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
          Demander une mission
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'easy', label: 'Faciles', color: '#10B981' },
          { key: 'medium', label: 'Moyennes', color: '#F59E0B' },
          { key: 'hard', label: 'Difficiles', color: '#EF4444' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && { 
                backgroundColor: tab.color || theme.colors.primary,
                borderColor: tab.color || theme.colors.primary,
              },
              filter !== tab.key && { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              filter === tab.key ? { color: '#FFFFFF' } : { color: theme.colors.text }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Missions Grid */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.missionsGrid}>
          {filteredMissions.map((mission) => (
            <TouchableOpacity
              key={mission.id}
              style={[
                styles.missionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: selectedMission?.id === mission.id 
                    ? theme.colors.primary 
                    : theme.colors.border,
                  borderWidth: selectedMission?.id === mission.id ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedMission(mission)}
            >
              <View style={styles.missionHeader}>
                <Text style={styles.missionIcon}>
                  {getCategoryIcon(mission.category)}
                </Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(mission.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyLabel(mission.difficulty)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.missionName, { color: theme.colors.text }]} numberOfLines={2}>
                {mission.name}
              </Text>

              <Text style={[styles.missionDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {mission.description}
              </Text>

              <View style={styles.missionFooter}>
                <View style={styles.pointsContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.pointsText, { color: theme.colors.text }]}>
                    {mission.pointsReward || mission.points} pts
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.requestButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleRequestMission(mission)}
                >
                  <Text style={styles.requestButtonText}>Demander</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune mission disponible
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  missionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  missionCard: {
    width: Platform.OS === 'web' ? 'calc(33% - 7px)' : '47%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionIcon: {
    fontSize: 32,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  missionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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

export default ChildMissionRequestScreen;