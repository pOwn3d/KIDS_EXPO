import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useSelector } from 'react-redux';
import { selectUserRole, selectCurrentUser } from '../../store/store';
import { useParentAccess } from '../../hooks/useParentAccess';

interface Punishment {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  duration?: string;
  childId?: string;
  childName?: string;
  assignedDate?: Date;
  status: 'active' | 'completed' | 'pending';
}

const PunishmentsListScreen: React.FC = () => {
  const theme = useTheme();
  const platform = usePlatform();
  const navigation = useNavigation();
  const userRole = useSelector(selectUserRole);
  const currentUser = useSelector(selectCurrentUser);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  
  // Utiliser le hook pour l'accès parent
  const { hasParentAccess } = useParentAccess();

  useEffect(() => {
    // Charger les punitions depuis l'API
    loadPunishments();
  }, []);

  const loadPunishments = () => {
    // Mock data pour l'instant
    setPunishments([
      {
        id: '1',
        name: 'Pas de télé',
        description: 'Interdiction de regarder la télévision',
        severity: 'medium',
        duration: '2 jours',
        childName: 'Emma',
        assignedDate: new Date('2024-01-15'),
        status: 'active',
      },
      {
        id: '2',
        name: 'Corvée supplémentaire',
        description: 'Faire la vaisselle pendant une semaine',
        severity: 'low',
        duration: '1 semaine',
        childName: 'Lucas',
        assignedDate: new Date('2024-01-14'),
        status: 'completed',
      },
      {
        id: '3',
        name: 'Pas de console',
        description: 'Interdiction de jouer aux jeux vidéo',
        severity: 'high',
        duration: '3 jours',
        childName: 'Sophie',
        assignedDate: new Date('2024-01-16'),
        status: 'active',
      },
    ]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.error;
      case 'high':
        return '#8B0000';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.error;
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleAddPunishment = () => {
    navigation.navigate('PunishmentManagement' as any);
  };

  const handlePunishmentPress = (punishment: Punishment) => {
    if (Platform.OS === 'web') {
      const message = `${punishment.name}\n\nDescription: ${punishment.description}\nDurée: ${punishment.duration}\nEnfant: ${punishment.childName}\nStatut: ${punishment.status}`;
      window.alert(message);
    } else {
      Alert.alert(
        punishment.name,
        `Description: ${punishment.description}\nDurée: ${punishment.duration}\nEnfant: ${punishment.childName}\nStatut: ${punishment.status}`,
        [
          { text: 'Fermer', style: 'cancel' },
          punishment.status === 'active' && hasParentAccess && {
            text: 'Terminer',
            onPress: () => completePunishment(punishment.id),
          },
        ].filter(Boolean)
      );
    }
  };

  const completePunishment = (id: string) => {
    setPunishments(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'completed' as const } : p
      )
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: platform.isDesktop ? 32 : 20,
      paddingVertical: platform.isDesktop ? 24 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: platform.isDesktop ? 28 : 24,
      fontWeight: 'bold',
      color: theme.colors.textInverse,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textInverse,
      opacity: 0.9,
      marginTop: 4,
    },
    addButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: platform.isDesktop ? 32 : 16,
    },
    punishmentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    punishmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    punishmentTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginLeft: 8,
    },
    severityText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    punishmentDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    punishmentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    punishmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.textInverse,
      textTransform: 'uppercase',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  // La vérification d'accès parent est déjà gérée par ParentZone
  // Plus besoin de vérifier le rôle ici

  return (
    <SafeAreaView style={styles.container}>
      {!platform.isDesktop && (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Punitions</Text>
            <Text style={styles.headerSubtitle}>
              Gérez les punitions de vos enfants
            </Text>
          </View>
          {hasParentAccess && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddPunishment}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {punishments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="happy"
              size={64}
              color={theme.colors.success}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Aucune punition active</Text>
            <Text style={styles.emptyText}>
              C'est bien ! Vos enfants se comportent bien.
            </Text>
          </View>
        ) : (
          punishments.map((punishment) => (
            <TouchableOpacity
              key={punishment.id}
              style={[
                styles.punishmentCard,
                { borderLeftColor: getSeverityColor(punishment.severity) },
              ]}
              onPress={() => handlePunishmentPress(punishment)}
            >
              <View style={styles.punishmentHeader}>
                <Text style={styles.punishmentTitle}>{punishment.name}</Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(punishment.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {punishment.severity === 'low'
                      ? 'Légère'
                      : punishment.severity === 'medium'
                      ? 'Moyenne'
                      : 'Sévère'}
                  </Text>
                </View>
              </View>

              <Text style={styles.punishmentDescription}>
                {punishment.description}
              </Text>

              <View style={styles.punishmentFooter}>
                <View style={styles.punishmentInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="person"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.infoText}>{punishment.childName}</Text>
                  </View>
                  {punishment.duration && (
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="time"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.infoText}>{punishment.duration}</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(punishment.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {punishment.status === 'active'
                      ? 'Active'
                      : punishment.status === 'completed'
                      ? 'Terminée'
                      : 'En attente'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {platform.isDesktop && punishments.length > 0 && hasParentAccess && (
          <TouchableOpacity
            style={[styles.addButton, { alignSelf: 'center', marginTop: 20 }]}
            onPress={handleAddPunishment}
          >
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Nouvelle punition</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PunishmentsListScreen;