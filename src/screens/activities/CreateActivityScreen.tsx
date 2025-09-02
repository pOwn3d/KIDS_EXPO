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
import { activitiesService } from '../../services/activities.service';
import { childrenService, type Child } from '../../services/children.service';

interface ActivityFormData {
  title: string;
  description: string;
  type: 'sport' | 'creative' | 'educational' | 'outdoor' | 'indoor' | 'social';
  duration?: string;
  maxParticipants?: string;
  minAge?: string;
  maxAge?: string;
  assignedTo: string[];
}

const CreateActivityScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    type: 'sport',
    assignedTo: [],
  });

  const activityTypes = [
    { value: 'sport', label: 'Sport', icon: '⚽', color: '#4CAF50' },
    { value: 'creative', label: 'Créatif', icon: '🎨', color: '#FF9800' },
    { value: 'educational', label: 'Éducatif', icon: '📚', color: '#2196F3' },
    { value: 'outdoor', label: 'Extérieur', icon: '🌳', color: '#8BC34A' },
    { value: 'indoor', label: 'Intérieur', icon: '🏠', color: '#9C27B0' },
    { value: 'social', label: 'Social', icon: '👥', color: '#607D8B' },
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
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour l\'activité');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    if (formData.assignedTo.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un enfant');
      return;
    }

    if (formData.duration && (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0)) {
      Alert.alert('Erreur', 'Veuillez saisir une durée valide');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎯 Création d\'activité:', formData);
      
      await activitiesService.createActivity({
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        minAge: formData.minAge ? parseInt(formData.minAge) : undefined,
        maxAge: formData.maxAge ? parseInt(formData.maxAge) : undefined,
        participants: formData.assignedTo,
      });

      Alert.alert(
        'Succès',
        'Activité créée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur création activité:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer l\'activité. Veuillez réessayer.',
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

  const TypeSelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Type d'activité
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
        {activityTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              {
                backgroundColor: formData.type === type.value ? type.color : theme.colors.surface,
                borderColor: formData.type === type.value ? type.color : theme.colors.border,
              },
            ]}
            onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeText,
                {
                  color: formData.type === type.value ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ChildrenSelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Participants *
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Sélectionnez les enfants qui participent
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
          Nouvelle activité
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
        {/* Titre */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Titre de l'activité *
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
            placeholder="Ex: Match de foot"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
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
            placeholder="Décrivez l'activité, les règles, l'équipement nécessaire..."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <TypeSelector />

        {/* Durée */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Durée (en minutes, optionnel)
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
            placeholder="Ex: 60"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Participants max */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nombre max de participants
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
            value={formData.maxParticipants}
            onChangeText={(text) => setFormData(prev => ({ ...prev, maxParticipants: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

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
  typesScroll: {
    flexDirection: 'row',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  childCard: {
    width: Platform.OS === 'web' ? 200 : '48%',
    marginRight: Platform.OS === 'web' ? 12 : '2%',
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

export default CreateActivityScreen;