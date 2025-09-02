import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { useMissions } from '../../hooks';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;
const isLargeDesktop = screenWidth >= 1440;

interface MissionCardProps {
  mission: any;
  onPress: () => void;
  onValidate?: () => void;
  cardWidth?: number;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onPress, onValidate, cardWidth }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (mission.status) {
      case 'completed': return '#10B981';
      case 'pending_validation': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'active': return '#0EA5E9';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (mission.status) {
      case 'completed': return 'checkmark-circle';
      case 'pending_validation': return 'time';
      case 'failed': return 'close-circle';
      case 'active': return 'play-circle';
      default: return 'pause-circle';
    }
  };

  const getTypeIcon = () => {
    switch (mission.type) {
      case 'daily': return 'today';
      case 'weekly': return 'calendar';
      case 'monthly': return 'calendar-outline';
      default: return 'flag';
    }
  };

  const getCategoryIcon = () => {
    switch (mission.category) {
      case 'chores': return 'home';
      case 'homework': return 'school';
      case 'exercise': return 'fitness';
      case 'reading': return 'book';
      case 'behavior': return 'happy';
      default: return 'list';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.missionCard,
        { 
          width: cardWidth || '100%',
          minWidth: isDesktop ? 350 : 300,
          maxWidth: isDesktop ? 450 : '100%',
        }
      ]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[getStatusColor() + '10', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={getCategoryIcon() as any} 
              size={16} 
              color={getStatusColor()} 
            />
            <Text style={[styles.categoryText, { color: getStatusColor() }]}>
              {mission.category || 'Général'}
            </Text>
          </View>
          
          <View style={styles.typeBadge}>
            <Ionicons 
              name={getTypeIcon() as any} 
              size={14} 
              color="#6B7280" 
            />
            <Text style={styles.typeText}>
              {mission.type === 'daily' ? 'Quotidien' : 
               mission.type === 'weekly' ? 'Hebdomadaire' :
               mission.type === 'monthly' ? 'Mensuel' : 'Unique'}
            </Text>
          </View>
        </View>

        {/* Mission Content */}
        <View style={styles.cardContent}>
          <Text style={styles.missionTitle} numberOfLines={2}>
            {mission.name}
          </Text>
          <Text style={styles.missionDescription} numberOfLines={2}>
            {mission.description}
          </Text>
          
          {/* Points and Status */}
          <View style={styles.cardFooter}>
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.pointsText}>{mission.points} points</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Ionicons 
                name={getStatusIcon() as any} 
                size={16} 
                color={getStatusColor()} 
              />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {mission.status === 'active' ? 'Active' :
                 mission.status === 'completed' ? 'Complétée' :
                 mission.status === 'pending_validation' ? 'En validation' :
                 mission.status === 'failed' ? 'Échouée' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          {/* Due Date if present */}
          {mission.dueDate && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="alarm-outline" size={14} color="#6B7280" />
              <Text style={styles.dueDateText}>
                Échéance: {new Date(mission.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Button for pending validation */}
        {mission.status === 'pending_validation' && onValidate && (
          <TouchableOpacity 
            style={styles.validateButton}
            onPress={onValidate}
          >
            <Text style={styles.validateButtonText}>Valider</Text>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ResponsiveMissionsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { missions, isLoading, refreshMissions } = useMissions();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'Toutes', icon: 'apps' },
    { id: 'active', label: 'Actives', icon: 'play-circle' },
    { id: 'pending_validation', label: 'À valider', icon: 'time' },
    { id: 'completed', label: 'Complétées', icon: 'checkmark-circle' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMissions();
    setRefreshing(false);
  };

  const handleValidateMission = async (missionId: string) => {
    Alert.alert(
      'Valider la mission',
      'Êtes-vous sûr de vouloir valider cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          onPress: async () => {
            try {
              // TODO: Implement validation logic
              console.log('Validating mission:', missionId);
              Alert.alert('Succès', 'Mission validée avec succès');
              await refreshMissions();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de valider la mission');
            }
          }
        }
      ]
    );
  };

  const filteredMissions = missions?.filter(mission => {
    const matchesFilter = selectedFilter === 'all' || mission.status === selectedFilter;
    const matchesSearch = mission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mission.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const getGridColumns = () => {
    if (isLargeDesktop) return 3;
    if (isDesktop) return 2;
    if (isTablet) return 2;
    return 1;
  };

  const columns = getGridColumns();
  const cardWidth = isDesktop 
    ? (screenWidth - 320 - (columns + 1) * 20) / columns
    : isTablet 
    ? (screenWidth - 100 - (columns + 1) * 16) / columns
    : screenWidth - 32;

  const contentPadding = isDesktop ? 32 : isTablet ? 24 : 16;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Header */}
      <View style={[styles.header, { padding: contentPadding }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: isDesktop ? 32 : 28 }]}>
              Missions
            </Text>
            <Text style={styles.headerSubtitle}>
              {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''} trouvée{filteredMissions.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          {isDesktop && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateMission' as never)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Nouvelle Mission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { marginTop: isDesktop ? 24 : 16 }]}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une mission..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={selectedFilter === filter.id ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Missions Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.missionsGrid,
          { 
            padding: contentPadding,
            flexDirection: isTablet ? 'row' : 'column',
            flexWrap: isTablet ? 'wrap' : 'nowrap',
            gap: isDesktop ? 20 : 16,
          }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              cardWidth={cardWidth}
              onPress={() => navigation.navigate('MissionDetail' as never, { missionId: mission.id } as never)}
              onValidate={mission.status === 'pending_validation' ? 
                () => handleValidateMission(mission.id) : undefined
              }
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Aucune mission trouvée</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 
                "Essayez de modifier votre recherche" : 
                "Créez votre première mission pour commencer"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateMission' as never)}
              >
                <Text style={styles.createButtonText}>Créer une Mission</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Mobile/Tablet */}
      {!isDesktop && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreateMission' as never)}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0EA5E9',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  missionsGrid: {
    paddingBottom: 100,
  },
  missionCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#6B7280',
  },
  cardContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dueDateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default ResponsiveMissionsScreen;