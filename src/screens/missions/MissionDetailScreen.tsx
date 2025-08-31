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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import type { Mission } from '../../services/missions.service';

const MissionDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { missionId } = route.params as { missionId: string };
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMissionDetails();
  }, [missionId]);

  const loadMissionDetails = async () => {
    try {
      // Pour l'instant, on récupère toutes les missions et on trouve celle qui correspond
      const missions = await missionsService.getAllMissions();
      const foundMission = missions.find(m => m.id === missionId);
      setMission(foundMission || null);
    } catch (error) {
      console.error('Erreur chargement mission:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la mission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!mission) return;

    const newStatus = mission.status === 'active' ? 'inactive' : 'active';
    
    try {
      await missionsService.updateMission(mission.id, { status: newStatus });
      setMission(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Succès', `Mission ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut de la mission');
    }
  };

  const handleDelete = () => {
    if (!mission) return;

    Alert.alert(
      'Supprimer la mission',
      `Êtes-vous sûr de vouloir supprimer la mission "${mission.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: deleteMission,
        },
      ]
    );
  };

  const deleteMission = async () => {
    if (!mission) return;

    try {
      await missionsService.deleteMission(mission.id);
      Alert.alert(
        'Succès',
        'Mission supprimée avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la mission');
    }
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      menage: 'Ménage',
      devoirs: 'Devoirs',
      sport: 'Sport',
      creativite: 'Créativité',
      lecture: 'Lecture',
      aide: 'Aide aux autres',
      responsabilite: 'Responsabilité',
      general: 'Général',
    };
    return labels[category] || 'Général';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Mission introuvable
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Détails de la mission
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Mission Card */}
        <View style={[styles.missionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.missionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.missionIcon}>
                {getMissionIcon(mission.category || 'general')}
              </Text>
            </View>
            <View style={styles.missionInfo}>
              <Text style={[styles.missionTitle, { color: theme.colors.text }]}>
                {mission.name}
              </Text>
              <View style={styles.badgesContainer}>
                <View style={[styles.statusBadge, {
                  backgroundColor: mission.status === 'active' ? '#10B981' : '#6B7280'
                }]}>
                  <Text style={styles.badgeText}>
                    {mission.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getDifficultyColor(mission.type) }]}>
                  <Text style={styles.badgeText}>
                    {getDifficultyLabel(mission.type)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.missionDescription, { color: theme.colors.textSecondary }]}>
            {mission.description}
          </Text>
        </View>

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.detailLabelText, { color: theme.colors.text }]}>
                Points
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {mission.points} points
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="folder" size={20} color={theme.colors.primary} />
              <Text style={[styles.detailLabelText, { color: theme.colors.text }]}>
                Catégorie
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {getCategoryLabel(mission.category || 'general')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              <Text style={[styles.detailLabelText, { color: theme.colors.text }]}>
                Fréquence
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {getDifficultyLabel(mission.type)}
            </Text>
          </View>

          {mission.dueDate && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.detailLabelText, { color: theme.colors.text }]}>
                  Date limite
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(mission.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}

          {mission.assignedTo && mission.assignedTo.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text style={[styles.detailLabelText, { color: theme.colors.text }]}>
                  Assignée à
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {mission.assignedTo.length} enfant(s)
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: mission.status === 'active' ? '#FF6B6B' : '#10B981' }
            ]}
            onPress={handleToggleStatus}
          >
            <Ionicons 
              name={mission.status === 'active' ? 'pause' : 'play'} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {mission.status === 'active' ? 'Désactiver' : 'Activer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              Supprimer la mission
            </Text>
          </TouchableOpacity>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  missionCard: {
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  missionIcon: {
    fontSize: 30,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  missionDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsCard: {
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabelText: {
    fontSize: 16,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MissionDetailScreen;