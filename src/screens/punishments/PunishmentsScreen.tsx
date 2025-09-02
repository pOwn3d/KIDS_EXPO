import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';
import { usePunishments, useChildren } from '../../hooks';
import { AnimatedCard, Button3D } from '../../components/ui';
import { Punishment, PunishmentCategory, PunishmentDifficulty } from '../../types/api/punishments';
import { AgeGroup } from '../../types/api/children';

const CATEGORY_COLORS = {
  general: '#6BCF7F',
  digital: '#45B7D1',
  physical: '#FFA07A',
  social: '#FFD93D',
  educational: '#A8E6CF',
} as const;

const DIFFICULTY_COLORS = {
  easy: '#98D8C8',
  medium: '#FFD93D',
  hard: '#FF6B6B',
} as const;

const PunishmentsScreen: React.FC = () => {
  const theme = useTheme();
  const platform = usePlatform();
  
  const {
    punishments,
    punishmentsByCategory,
    punishmentsByDifficulty,
    punishmentStats,
    mostUsedPunishments,
    isLoading,
    error,
    fetchPunishments,
    applyPunishment,
    createPunishment,
    updatePunishment,
    deletePunishment,
    clearError,
  } = usePunishments();
  
  const { children, fetchChildren } = useChildren();
  
  const [selectedCategory, setSelectedCategory] = useState<PunishmentCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<PunishmentDifficulty | 'all'>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPunishment, setSelectedPunishment] = useState<Punishment | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Form states for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as PunishmentCategory,
    difficulty: 'medium' as PunishmentDifficulty,
    ageGroup: '6-8' as AgeGroup,
    defaultDuration: 24,
  });

  // Apply punishment form
  const [applyFormData, setApplyFormData] = useState({
    reason: '',
    duration: 24,
  });

  // Responsive values
  const containerPadding = useResponsive({
    mobile: 16,
    tablet: 24,
    desktop: 32,
  });

  const cardMargin = useResponsive({
    mobile: 8,
    tablet: 12,
    desktop: 16,
  });

  // Load data on mount
  useEffect(() => {
    fetchPunishments();
    fetchChildren();
  }, [fetchPunishments, fetchChildren]);

  // Filter punishments based on selected filters
  const filteredPunishments = punishments.filter(punishment => {
    if (selectedCategory !== 'all' && punishment.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && punishment.difficulty !== selectedDifficulty) return false;
    if (selectedAgeGroup !== 'all' && punishment.ageGroup !== selectedAgeGroup) return false;
    return punishment.isActive;
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPunishments(),
        fetchChildren(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPunishments, fetchChildren]);

  const handleCreatePunishment = async () => {
    try {
      await createPunishment(formData).unwrap();
      Alert.alert('Succès', 'Punition créée avec succès');
      setShowCreateModal(false);
      resetForm();
      fetchPunishments();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la punition');
    }
  };

  const handleApplyPunishment = async () => {
    if (!selectedPunishment || !selectedChildId) return;

    try {
      await applyPunishment(
        selectedPunishment.id,
        parseInt(selectedChildId),
        applyFormData.reason,
        applyFormData.duration
      ).unwrap();
      
      Alert.alert('Succès', 'Punition appliquée avec succès');
      setShowApplyModal(false);
      resetApplyForm();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'appliquer la punition');
    }
  };

  const handleDeletePunishment = (punishment: Punishment) => {
    Alert.alert(
      'Supprimer la punition',
      `Êtes-vous sûr de vouloir supprimer "${punishment.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePunishment(punishment.id).unwrap();
              Alert.alert('Succès', 'Punition supprimée');
              fetchPunishments();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      difficulty: 'medium',
      ageGroup: '6-8',
      defaultDuration: 24,
    });
  };

  const resetApplyForm = () => {
    setApplyFormData({
      reason: '',
      duration: 24,
    });
    setSelectedPunishment(null);
    setSelectedChildId('');
  };

  const renderPunishmentCard = ({ item }: { item: Punishment }) => (
    <AnimatedCard style={[styles.punishmentCard, { margin: cardMargin }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={[styles.punishmentTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.badges}>
            <View style={[
              styles.badge,
              { backgroundColor: CATEGORY_COLORS[item.category] + '20' }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: CATEGORY_COLORS[item.category] }
              ]}>
                {item.category}
              </Text>
            </View>
            <View style={[
              styles.badge,
              { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '20' }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: DIFFICULTY_COLORS[item.difficulty] }
              ]}>
                {item.difficulty}
              </Text>
            </View>
            <View style={[
              styles.badge,
              { backgroundColor: theme.colors.textSecondary + '20' }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: theme.colors.textSecondary }
              ]}>
                {item.ageGroup} ans
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => {
              setSelectedPunishment(item);
              setShowApplyModal(true);
            }}
          >
            <Ionicons name="play" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={() => handleDeletePunishment(item)}
          >
            <Ionicons name="trash" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.punishmentDescription, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
          Durée par défaut: {item.defaultDuration}h
        </Text>
        <Text style={[styles.usageText, { color: theme.colors.textSecondary }]}>
          Utilisé {mostUsedPunishments.find(p => p.id === item.id)?.usageCount || 0} fois
        </Text>
      </View>
    </AnimatedCard>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Filtres:</Text>
      
      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['all', ...Object.keys(CATEGORY_COLORS)] as (PunishmentCategory | 'all')[]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedCategory === item 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[
              styles.filterChipText,
              {
                color: selectedCategory === item 
                  ? theme.colors.textInverse 
                  : theme.colors.text,
              }
            ]}>
              {item === 'all' ? 'Toutes' : item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: containerPadding,
      paddingVertical: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.text,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: containerPadding,
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      marginHorizontal: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    statValue: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    filtersContainer: {
      paddingHorizontal: containerPadding,
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      marginBottom: 8,
    },
    filterList: {
      paddingVertical: 4,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
    },
    filterChipText: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    punishmentCard: {
      marginHorizontal: containerPadding,
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    cardTitle: {
      flex: 1,
      marginRight: 12,
    },
    punishmentTitle: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      marginBottom: 8,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 4,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    punishmentDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    durationText: {
      fontSize: 12,
    },
    usageText: {
      fontSize: 12,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    picker: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    pickerText: {
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Punitions</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={20} color={theme.colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{punishmentStats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{punishmentStats.active}</Text>
          <Text style={styles.statLabel}>Actives</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mostUsedPunishments.length}</Text>
          <Text style={styles.statLabel}>Utilisées</Text>
        </View>
      </View>

      {/* Filters */}
      {renderFilterChips()}

      {/* Punishments List */}
      <FlatList
        data={filteredPunishments}
        renderItem={renderPunishmentCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Create Punishment Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer une Punition</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Titre de la punition"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description..."
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <Button3D
                title="Annuler"
                variant="ghost"
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                style={{ flex: 1 }}
              />
              <Button3D
                title="Créer"
                variant="primary"
                onPress={handleCreatePunishment}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Apply Punishment Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowApplyModal(false);
          resetApplyForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Appliquer: {selectedPunishment?.title}
            </Text>
            
            {/* Child Selection would go here */}
            <Text style={[styles.pickerText, { color: theme.colors.textSecondary }]}>
              Sélection d'enfant à implémenter
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Raison (optionnel)"
              placeholderTextColor={theme.colors.textSecondary}
              value={applyFormData.reason}
              onChangeText={(text) => setApplyFormData(prev => ({ ...prev, reason: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Durée en heures"
              placeholderTextColor={theme.colors.textSecondary}
              value={applyFormData.duration.toString()}
              onChangeText={(text) => setApplyFormData(prev => ({ 
                ...prev, 
                duration: parseInt(text) || 24 
              }))}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button3D
                title="Annuler"
                variant="ghost"
                onPress={() => {
                  setShowApplyModal(false);
                  resetApplyForm();
                }}
                style={{ flex: 1 }}
              />
              <Button3D
                title="Appliquer"
                variant="primary"
                onPress={handleApplyPunishment}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PunishmentsScreen;