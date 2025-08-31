import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCard, Button3D } from '../../components/ui';
import { dashboardService } from '../../services/dashboard.service';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/store';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  subtitle?: string;
}

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, subtitle }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardIcon}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.statCardContent}>
          <Text style={styles.statCardValue}>{value}</Text>
          <Text style={styles.statCardTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.statCardSubtitle}>{subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onPress }) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text 
        style={[styles.quickActionTitle, { color: theme.colors.text }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Helper function pour formater le temps relatif
const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
};

const ParentDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Données réelles du dashboard
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalPoints: 0,
    activeMissions: 0,
    availableRewards: 0,
    pendingValidations: 0,
  });
  const [children, setChildren] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // Charger les données au montage si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      // Si pas authentifié, rediriger vers Auth
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    }
  }, [isAuthenticated]);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await dashboardService.getParentDashboard();
      
      setStats(dashboardData.stats);
      setChildren(dashboardData.children);
      setRecentActivities(dashboardData.recentActivities);
    } catch (error: any) {
      console.error('Dashboard load error:', error);
      // Si erreur d'auth, rediriger vers login
      if (error.message.includes('authentication')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' as never }],
        });
      } else {
        Alert.alert('Erreur', 'Impossible de charger le tableau de bord');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleAddChild = async () => {
    if (!childName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de l\'enfant');
      return;
    }
    
    if (!childAge.trim() || isNaN(parseInt(childAge))) {
      Alert.alert('Erreur', 'Veuillez entrer un âge valide');
      return;
    }
    
    try {
      await dashboardService.addChild(childName, childAge);
      Alert.alert('Succès', `${childName} a été ajouté(e) avec succès !`);
      setShowAddChildModal(false);
      setChildName('');
      setChildAge('');
      // Recharger les données
      loadDashboardData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter l\'enfant');
    }
  };

  const quickActions = [
    {
      title: 'Créer Mission',
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Missions' as never),
    },
    {
      title: 'Créer Récompense',
      icon: 'gift' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('Rewards' as never),
    },
    {
      title: 'Échanger Points',
      icon: 'swap-horizontal' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.kids.green,
      onPress: () => Alert.alert('Échanger', 'Fonctionnalité à venir'),
    },
    {
      title: 'Top Enfants',
      icon: 'trophy' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.kids.yellow,
      onPress: () => navigation.navigate('Leaderboard' as never),
    },
    {
      title: 'Analyses',
      icon: 'analytics' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.kids.blue,
      onPress: () => Alert.alert('Analyses', 'Fonctionnalité à venir'),
    },
    {
      title: 'Gérer Points',
      icon: 'settings' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.kids.purple,
      onPress: () => Alert.alert('Gérer', 'Fonctionnalité à venir'),
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textLight }]}>
            Chargement du tableau de bord...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textLight }]}>
              Bonjour,
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              Tableau de bord 📊
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            {stats.pendingValidations > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{stats.pendingValidations}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Enfants"
            value={stats.totalChildren}
            icon="people"
            gradient={[theme.colors.secondary, theme.colors.primary]}
            subtitle="Profils actifs"
          />
          <StatCard
            title="Points Totaux"
            value={stats.totalPoints}
            icon="star"
            gradient={[theme.colors.kids.yellow, theme.colors.kids.orange]}
            subtitle="Cette semaine"
          />
          <StatCard
            title="Missions Actives"
            value={stats.activeMissions}
            icon="rocket"
            gradient={[theme.colors.kids.blue, theme.colors.kids.teal]}
            subtitle="En cours"
          />
          <StatCard
            title="Récompenses"
            value={stats.availableRewards}
            icon="gift"
            gradient={[theme.colors.kids.pink, theme.colors.kids.purple]}
            subtitle="Disponibles"
          />
        </View>

        {/* Add Child Button */}
        <TouchableOpacity 
          style={styles.addChildButton}
          onPress={() => setShowAddChildModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addChildButtonGradient}
          >
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.addChildButtonText}>Ajouter un Enfant</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions Rapides
          </Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              icon={action.icon}
              color={action.color}
              onPress={action.onPress}
            />
          ))}
        </View>

        {/* Recent Activity */}
        {recentActivities.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Activité Récente
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>

            <AnimatedCard style={styles.activityCard}>
              {recentActivities.slice(0, 5).map((activity, index) => (
                <View key={activity.id || index} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: (activity.color || theme.colors.primary) + '20' }]}>
                    <Ionicons 
                      name={activity.icon || 'star'} 
                      size={20} 
                      color={activity.color || theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                      {activity.childName} - {activity.description}
                    </Text>
                    <Text style={[styles.activityTime, { color: theme.colors.textLight }]}>
                      {formatRelativeTime(activity.timestamp)} 
                      {activity.points && ` • ${activity.points > 0 ? '+' : ''}${activity.points} points`}
                    </Text>
                  </View>
                </View>
              ))}
              
              {recentActivities.length === 0 && (
                <Text style={[styles.noActivityText, { color: theme.colors.textLight }]}>
                  Aucune activité récente
                </Text>
              )}
            </AnimatedCard>
          </>
        )}
      </ScrollView>

      {/* Add Child Modal */}
      <Modal
        visible={showAddChildModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddChildModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Ajouter un Enfant
              </Text>
              <TouchableOpacity onPress={() => setShowAddChildModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Nom de l'enfant
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Entrez le nom"
                placeholderTextColor={theme.colors.textLight}
                value={childName}
                onChangeText={setChildName}
              />

              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Âge
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                placeholder="Entrez l'âge"
                placeholderTextColor={theme.colors.textLight}
                value={childAge}
                onChangeText={setChildAge}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <Button3D
                  title="Annuler"
                  variant="ghost"
                  onPress={() => setShowAddChildModal(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button3D
                  title="Ajouter"
                  variant="primary"
                  onPress={handleAddChild}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 16,
    fontSize: 16,
  },
  noActivityText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statCardContent: {
    flex: 1,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statCardTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statCardSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  addChildButton: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  addChildButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addChildButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
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
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
});

export default ParentDashboardScreen;