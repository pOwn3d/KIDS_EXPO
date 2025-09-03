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
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { missionsService } from '../../services/missions.service';
import { childrenService, type Child } from '../../services/children.service';
import { AppSpacing, CommonStyles } from '../../constants/spacing';
import { useDispatch } from 'react-redux';
import { fetchMissionsAsync } from '../../store/slices/missionsSlice';
import { AppDispatch } from '../../store/store';
import { Toast, useToast } from '../../components/ui/Toast';

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
  const dispatch = useDispatch<AppDispatch>();
  const { toast, showToast, hideToast } = useToast();
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

  const handleGoBack = () => {
    if (Platform.OS === 'web') {
      // Sur le web, naviguer explicitement vers la liste des missions
      navigation.navigate('MissionsList' as any);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    console.log('🎯 handleSubmit appelé, formData:', formData);
    
    // Validation
    if (!formData.name.trim()) {
      console.log('❌ Validation échouée: nom manquant');
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la mission');
      return;
    }

    if (!formData.description.trim()) {
      console.log('❌ Validation échouée: description manquante');
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    const points = parseInt(formData.points);
    if (isNaN(points) || points <= 0) {
      console.log('❌ Validation échouée: points invalides', { points: formData.points, parsed: points });
      Alert.alert('Erreur', 'Veuillez saisir un nombre de points valide');
      return;
    }

    if (formData.assignedTo.length === 0) {
      console.log('❌ Validation échouée: aucun enfant assigné', { assignedTo: formData.assignedTo });
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un enfant');
      return;
    }

    console.log('✅ Toutes les validations passées, création en cours...');

    setIsLoading(true);

    try {
      console.log('🎯 Création de mission:', formData);
      
      const newMission = await missionsService.createMission({
        name: formData.name.trim(),
        description: formData.description.trim(),
        points: points,
        type: formData.type,
        category: formData.category,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
      });

      console.log('✅ Mission créée dans CreateMissionScreen:', newMission);

      // Rafraîchir la liste des missions dans Redux
      dispatch(fetchMissionsAsync());

      // Afficher le toast de succès
      if (Platform.OS === 'web') {
        showToast('Mission créée avec succès !', 'success');
        setTimeout(() => {
          // Naviguer explicitement vers la liste sur le web
          navigation.navigate('MissionsList' as any);
        }, 1500);
      } else {
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
      }
    } catch (error: any) {
      console.error('❌ Erreur dans CreateMissionScreen:', error);
      if (Platform.OS === 'web') {
        showToast('Impossible de créer la mission. Veuillez réessayer.', 'error');
      } else {
        Alert.alert(
          'Erreur',
          'Impossible de créer la mission. Veuillez réessayer.',
          [{ text: 'OK' }]
        );
      }
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
          onPress={handleGoBack}
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
      
      {/* Toast pour les messages */}
      {toast && toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: CommonStyles.container,
  header: CommonStyles.header,
  backButton: CommonStyles.backButton,
  headerTitle: CommonStyles.headerTitle,
  saveButton: CommonStyles.button,
  saveButtonText: CommonStyles.buttonText,
  content: CommonStyles.content,
  section: CommonStyles.section,
  sectionTitle: CommonStyles.sectionTitle,
  sectionSubtitle: CommonStyles.sectionSubtitle,
  textInput: CommonStyles.textInput,
  textArea: CommonStyles.textArea,
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
  childrenGrid: CommonStyles.childrenGrid,
  childCard: CommonStyles.childCard,
  childAvatar: CommonStyles.childAvatar,
  childName: CommonStyles.childName,
  selectedBadge: CommonStyles.selectedBadge,
  bottomPadding: CommonStyles.bottomPadding,
});

export default CreateMissionScreen;