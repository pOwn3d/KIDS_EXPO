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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import { childrenService, type Child } from '../../services/children.service';

interface MissionFormData {
  name: string;
  description: string;
  points: string;
  type: 'once' | 'daily' | 'weekly' | 'monthly';
  category: string;
  assignedTo: string[];
  dueDate?: string;
}

const CreateMissionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [formData, setFormData] = useState<MissionFormData>({
    name: '',
    description: '',
    points: '',
    type: 'once',
    category: 'general',
    assignedTo: [],
  });

  const categories = [
    { value: 'menage', label: 'Ménage', icon: '🧹' },
    { value: 'devoirs', label: 'Devoirs', icon: '📚' },
    { value: 'sport', label: 'Sport', icon: '⚽' },
    { value: 'creativite', label: 'Créativité', icon: '🎨' },
    { value: 'lecture', label: 'Lecture', icon: '📖' },
    { value: 'aide', label: 'Aide aux autres', icon: '🤝' },
    { value: 'responsabilite', label: 'Responsabilité', icon: '⭐' },
    { value: 'general', label: 'Général', icon: '🎯' },
  ];

  const types = [
    { value: 'once', label: 'Une seule fois', description: 'Mission à faire une seule fois' },
    { value: 'daily', label: 'Quotidienne', description: 'Mission à répéter chaque jour' },
    { value: 'weekly', label: 'Hebdomadaire', description: 'Mission à répéter chaque semaine' },
    { value: 'monthly', label: 'Mensuelle', description: 'Mission à répéter chaque mois' },
  ];

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const allChildren = await childrenService.getAllChildren();
      setChildren(allChildren);
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la mission');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    const points = parseInt(formData.points);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de points valide');
      return;
    }

    if (formData.assignedTo.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un enfant');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎯 Création de mission:', formData);
      
      await missionsService.createMission({
        name: formData.name.trim(),
        description: formData.description.trim(),
        points: points,
        type: formData.type,
        category: formData.category,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
      });

      Alert.alert(
        'Succès',
        'Mission créée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur création mission:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer la mission. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(childId)
        ? prev.assignedTo.filter(id => id !== childId)
        : [...prev.assignedTo, childId],
    }));
  };

  const CategorySelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Catégorie
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,
              {
                backgroundColor: formData.category === category.value ? theme.colors.primary : theme.colors.surface,
                borderColor: formData.category === category.value ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                {
                  color: formData.category === category.value ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const TypeSelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Type de mission
      </Text>
      {types.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeOption,
            {
              backgroundColor: formData.type === type.value ? `${theme.colors.primary}20` : theme.colors.surface,
              borderColor: formData.type === type.value ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
        >
          <View style={styles.typeOptionContent}>
            <View style={[
              styles.radioButton,
              {
                borderColor: formData.type === type.value ? theme.colors.primary : theme.colors.border,
              },
            ]}>
              {formData.type === type.value && (
                <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <View style={styles.typeInfo}>
              <Text style={[styles.typeLabel, { color: theme.colors.text }]}>
                {type.label}
              </Text>
              <Text style={[styles.typeDescription, { color: theme.colors.textSecondary }]}>
                {type.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const ChildrenSelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Assigner à
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Sélectionnez les enfants qui doivent faire cette mission
      </Text>
      <View style={styles.childrenGrid}>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.childCard,
              {
                backgroundColor: formData.assignedTo.includes(String(child.id))
                  ? `${theme.colors.primary}20`
                  : theme.colors.surface,
                borderColor: formData.assignedTo.includes(String(child.id))
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => toggleChildSelection(String(child.id))}
          >
            <Text style={styles.childAvatar}>{child.avatar}</Text>
            <Text style={[styles.childName, { color: theme.colors.text }]}>
              {child.firstName || child.name}
            </Text>
            {formData.assignedTo.includes(String(child.id)) && (
              <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          Nouvelle mission
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Création...' : 'Créer'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nom */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nom de la mission *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Ex: Ranger sa chambre"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description *
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Décrivez ce que l'enfant doit faire..."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Points */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Points de récompense *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Ex: 10"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.points}
            onChangeText={(text) => setFormData(prev => ({ ...prev, points: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <CategorySelector />
        <TypeSelector />
        <ChildrenSelector />

        <View style={styles.bottomPadding} />
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeOption: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  childCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  childAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  childName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});

export default CreateMissionScreen;