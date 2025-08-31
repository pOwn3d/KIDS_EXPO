import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCard, ProgressBar, Badge } from '../../components/ui';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  points: number;
  level: number;
  completedMissions: number;
  activeMissions: number;
  streak: number;
  badges: string[];
}

const ChildrenListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  // Mock data - À remplacer par les vraies données du store
  const [children] = useState<Child[]>([
    {
      id: '1',
      name: 'Lucas',
      age: 8,
      points: 450,
      level: 5,
      completedMissions: 23,
      activeMissions: 3,
      streak: 7,
      badges: ['star', 'rocket', 'trophy'],
    },
    {
      id: '2',
      name: 'Emma',
      age: 10,
      points: 680,
      level: 7,
      completedMissions: 34,
      activeMissions: 2,
      streak: 12,
      badges: ['star', 'rocket', 'trophy', 'medal'],
    },
    {
      id: '3',
      name: 'Noah',
      age: 6,
      points: 320,
      level: 4,
      completedMissions: 18,
      activeMissions: 4,
      streak: 3,
      badges: ['star', 'rocket'],
    },
  ]);

  const handleChildPress = (child: Child) => {
    // TODO: Naviguer vers le profil détaillé de l'enfant
    Alert.alert('Profil', `Voir le profil de ${child.name}`);
  };

  const handleAddPoints = (child: Child) => {
    Alert.alert(
      'Ajouter des points',
      `Combien de points voulez-vous ajouter à ${child.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: '+10 points', onPress: () => console.log('+10') },
        { text: '+20 points', onPress: () => console.log('+20') },
        { text: '+50 points', onPress: () => console.log('+50') },
      ]
    );
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      [theme.colors.kids.blue, theme.colors.kids.teal],
      [theme.colors.kids.pink, theme.colors.kids.purple],
      [theme.colors.kids.orange, theme.colors.kids.yellow],
    ];
    return gradients[index % gradients.length];
  };

  const getLevelProgress = (points: number, level: number) => {
    const pointsPerLevel = 100;
    const currentLevelPoints = points % pointsPerLevel;
    return (currentLevelPoints / pointsPerLevel) * 100;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Mes Enfants
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => Alert.alert('Ajouter', 'Ajouter un nouvel enfant')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.kids.blue }]}>
              {children.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textLight }]}>
              Enfants
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.kids.yellow }]}>
              {children.reduce((sum, child) => sum + child.points, 0)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textLight }]}>
              Points totaux
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.kids.green }]}>
              {children.reduce((sum, child) => sum + child.completedMissions, 0)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textLight }]}>
              Missions
            </Text>
          </View>
        </View>

        {/* Children List */}
        {children.map((child, index) => (
          <AnimatedCard 
            key={child.id}
            style={styles.childCard}
            animation="scale"
            pressable
            onPress={() => handleChildPress(child)}
          >
            <View style={styles.childCardContent}>
              {/* Avatar */}
              <LinearGradient
                colors={getAvatarGradient(index)}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {child.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>

              {/* Info */}
              <View style={styles.childInfo}>
                <View style={styles.childHeader}>
                  <Text style={[styles.childName, { color: theme.colors.text }]}>
                    {child.name}
                  </Text>
                  <Text style={[styles.childAge, { color: theme.colors.textLight }]}>
                    {child.age} ans
                  </Text>
                </View>

                {/* Level Progress */}
                <View style={styles.levelContainer}>
                  <View style={styles.levelHeader}>
                    <Text style={[styles.levelText, { color: theme.colors.textSecondary }]}>
                      Niveau {child.level}
                    </Text>
                    <Text style={[styles.pointsText, { color: theme.colors.kids.yellow }]}>
                      {child.points} pts
                    </Text>
                  </View>
                  <ProgressBar
                    value={getLevelProgress(child.points, child.level)}
                    height={6}
                    color={theme.colors.kids.blue}
                    gradient
                    animated
                    style={{ marginTop: 4 }}
                  />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.kids.green} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {child.completedMissions}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="rocket" size={14} color={theme.colors.kids.orange} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {child.activeMissions}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="flame" size={14} color={theme.colors.kids.red} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {child.streak}j
                    </Text>
                  </View>
                </View>

                {/* Badges */}
                <View style={styles.badgesRow}>
                  {child.badges.map((badge, badgeIndex) => (
                    <View 
                      key={badgeIndex}
                      style={[styles.badge, { backgroundColor: theme.colors.kids.purple + '20' }]}
                    >
                      <Ionicons name={badge as any} size={12} color={theme.colors.kids.purple} />
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.childActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
                  onPress={() => handleAddPoints(child)}
                >
                  <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.kids.green + '20' }]}
                  onPress={() => Alert.alert('Mission', `Assigner une mission à ${child.name}`)}
                >
                  <Ionicons name="rocket" size={20} color={theme.colors.kids.green} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.textLight + '20' }]}
                  onPress={() => handleChildPress(child)}
                >
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  childCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childInfo: {
    flex: 1,
    marginLeft: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
  },
  childAge: {
    fontSize: 14,
    marginLeft: 8,
  },
  levelContainer: {
    marginBottom: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  childActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

export default ChildrenListScreen;