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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';
import { usePunishments, useChildren } from '../../hooks';
import { AnimatedCard, Button3D } from '../../components/ui';
import { AppliedPunishment } from '../../types/api/punishments';

interface Props {
  route: {
    params: {
      childId: string;
      childName?: string;
    };
  };
  navigation: any;
}

const ActivePunishmentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { childId, childName } = route.params;
  const theme = useTheme();
  const platform = usePlatform();
  
  const {
    activePunishmentsByChild,
    fetchActivePunishments,
    deactivatePunishment,
    isLoading,
    error,
  } = usePunishments();
  
  const [refreshing, setRefreshing] = useState(false);

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

  // Load active punishments on mount
  useEffect(() => {
    fetchActivePunishments(parseInt(childId));
  }, [childId, fetchActivePunishments]);

  // Get active punishments for this child
  const activePunishments = activePunishmentsByChild[childId] || [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchActivePunishments(parseInt(childId));
    } finally {
      setRefreshing(false);
    }
  }, [childId, fetchActivePunishments]);

  const handleDeactivate = (appliedPunishment: AppliedPunishment) => {
    Alert.alert(
      'Lever la punition',
      `Êtes-vous sûr de vouloir lever cette punition pour ${childName || 'cet enfant'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Lever',
          style: 'default',
          onPress: async () => {
            try {
              await deactivatePunishment(appliedPunishment.id, parseInt(childId)).unwrap();
              Alert.alert('Succès', 'Punition levée avec succès');
              fetchActivePunishments(parseInt(childId));
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de lever la punition');
            }
          },
        },
      ]
    );
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expiré';
    }
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPunishmentCard = ({ item }: { item: AppliedPunishment }) => {
    const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
    
    return (
      <AnimatedCard style={[styles.punishmentCard, { margin: cardMargin }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={[styles.punishmentTitle, { color: theme.colors.text }]}>
              {item.punishmentTitle || 'Punition'}
            </Text>
            {item.reason && (
              <Text style={[styles.reason, { color: theme.colors.textSecondary }]}>
                Motif: {item.reason}
              </Text>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: isExpired
                  ? theme.colors.error + '20'
                  : item.isActive
                  ? theme.colors.error + '20'
                  : theme.colors.success + '20'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color: isExpired
                    ? theme.colors.error
                    : item.isActive
                    ? theme.colors.error
                    : theme.colors.success
                }
              ]}>
                {isExpired ? 'Expiré' : item.isActive ? 'Active' : 'Terminée'}
              </Text>
            </View>
          </View>
        </View>
        
        {item.punishmentDescription && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {item.punishmentDescription}
          </Text>
        )}
        
        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              Appliquée: {formatDate(item.appliedAt || '')}
            </Text>
          </View>
          
          {item.expiresAt && (
            <View style={styles.timeItem}>
              <Ionicons 
                name="hourglass-outline" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {isExpired ? 'Expirée' : `Expire dans: ${formatTimeRemaining(item.expiresAt)}`}
              </Text>
            </View>
          )}
        </View>
        
        {item.isActive && !isExpired && (
          <View style={styles.cardActions}>
            <Button3D
              title="Lever la punition"
              variant="ghost"
              onPress={() => handleDeactivate(item)}
              style={styles.actionButton}
              icon="checkmark-circle"
            />
          </View>
        )}
      </AnimatedCard>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="happy-outline"
        size={64}
        color={theme.colors.success}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Aucune punition active
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {childName || 'Cet enfant'} n'a actuellement aucune punition en cours.
      </Text>
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
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
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
      marginBottom: 4,
    },
    reason: {
      fontSize: 14,
      fontStyle: 'italic',
    },
    statusContainer: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    timeInfo: {
      marginBottom: 16,
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    timeText: {
      fontSize: 12,
      marginLeft: 8,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    actionButton: {
      flex: 0,
      paddingHorizontal: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: containerPadding,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Punitions Actives</Text>
          {childName && (
            <Text style={styles.subtitle}>{childName}</Text>
          )}
        </View>
      </View>

      {/* Punishments List */}
      {activePunishments.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={activePunishments}
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ActivePunishmentsScreen;