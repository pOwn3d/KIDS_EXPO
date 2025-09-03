import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { childrenService, type Child } from '../../services/children.service';
import { AppSpacing, CommonStyles } from '../../constants/spacing';

const ChildrenListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      const data = await childrenService.getAllChildren();
      setChildren(data);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChildren();
  };

  const handleAddChild = () => {
    navigation.navigate('AddChild' as any);
  };

  const handleChildPress = (childId: number) => {
    navigation.navigate('ChildProfile' as any, { childId });
  };

  const ChildCard: React.FC<{ child: Child }> = ({ child }) => (
    <TouchableOpacity
      style={[styles.childCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleChildPress(child.id)}
    >
      <View style={styles.childInfo}>
        <Text style={styles.childAvatar}>{child.avatar || '👦'}</Text>
        <View style={styles.childDetails}>
          <Text style={[styles.childName, { color: theme.colors.text }]}>
            {child.firstName} {child.lastName}
          </Text>
          <Text style={[styles.childAge, { color: theme.colors.textSecondary }]}>
            {child.age} ans
          </Text>
        </View>
      </View>
      
      <View style={styles.childStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {child.currentPoints || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {child.level || 1}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

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
              Mes enfants
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {children.length} enfant{children.length > 1 ? 's' : ''} inscrit{children.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddChild}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Sur Web, afficher le titre et bouton différemment */}
      {Platform.OS === 'web' && (
        <View style={styles.webHeader}>
          <Text style={[styles.webTitle, { color: theme.colors.text }]}>
            Gestion des enfants
          </Text>
          <TouchableOpacity
            style={[styles.webAddButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddChild}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.webAddButtonText}>Ajouter un enfant</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.childrenList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucun enfant ajouté
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddChild}
            >
              <Text style={styles.emptyButtonText}>Ajouter un enfant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.childrenGrid}>
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </View>
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
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  webTitle: {
    fontSize: 32,
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
  },
  webAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  webAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  childrenList: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  childrenGrid: {
    gap: 10,  // Réduit de 20px à 10px
    paddingBottom: 20,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  childInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 14,
  },
  childStats: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChildrenListScreen;