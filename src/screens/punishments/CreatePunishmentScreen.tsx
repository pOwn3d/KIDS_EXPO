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
import { punishmentsService } from '../../services/punishments.service';
import { childrenService, type Child } from '../../services/children.service';

interface PunishmentFormData {
  name: string;
  description: string;
  pointsDeduction: string;
  severity: 'light' | 'medium' | 'severe';
  duration?: string;
  assignedTo: string[];
}

const CreatePunishmentScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [formData, setFormData] = useState<PunishmentFormData>({
    name: '',
    description: '',
    pointsDeduction: '',
    severity: 'light',
    duration: '',
    assignedTo: [],
  });

  const severityLevels = [
    { value: 'light', label: 'Légère', icon: '⚠️', color: '#FFC107' },
    { value: 'medium', label: 'Moyenne', icon: '⚡', color: '#FF9800' },
    { value: 'severe', label: 'Sévère', icon: '🚫', color: '#F44336' },
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
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la punition');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    const points = parseInt(formData.pointsDeduction);
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
      console.log('⚠️ Création de punition:', formData);
      
      await punishmentsService.createPunishment({
        name: formData.name.trim(),
        description: formData.description.trim(),
        pointsDeduction: points,
        severity: formData.severity,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        childId: formData.assignedTo[0],
      });

      Alert.alert(
        'Succès',
        'Punition créée avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur création punition:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer la punition. Veuillez réessayer.',
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

  const SeveritySelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Sévérité
      </Text>
      <View style={styles.severityContainer}>
        {severityLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.severityOption,
              {
                backgroundColor: formData.severity === level.value 
                  ? `${level.color}20` 
                  : theme.colors.surface,
                borderColor: formData.severity === level.value 
                  ? level.color 
                  : theme.colors.border,
              },
            ]}
            onPress={() => setFormData(prev => ({ ...prev, severity: level.value as any }))}
          >
            <Text style={styles.severityIcon}>{level.icon}</Text>
            <Text
              style={[
                styles.severityText,
                {
                  color: formData.severity === level.value 
                    ? level.color 
                    : theme.colors.text,
                },
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ChildrenSelector: React.FC = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Assigner à *
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Sélectionnez l'enfant concerné
      </Text>
      <View style={styles.childrenGrid}>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.childCard,
              {
                backgroundColor: formData.assignedTo.includes(String(child.id))
                  ? `${theme.colors.warning}20`
                  : theme.colors.surface,
                borderColor: formData.assignedTo.includes(String(child.id))
                  ? theme.colors.warning
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
              <View style={[styles.selectedBadge, { backgroundColor: theme.colors.warning }]}>
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
          Nouvelle punition
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.warning,
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
            Nom de la punition *
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
            placeholder="Ex: Pas de console"
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
            placeholder="Expliquez la raison et les conditions..."
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
            Points à retirer *
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
            placeholder="Ex: 50"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.pointsDeduction}
            onChangeText={(text) => setFormData(prev => ({ ...prev, pointsDeduction: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        {/* Durée */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Durée (en jours, optionnel)
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
            placeholder="Ex: 3 (laisser vide si immédiat)"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        <SeveritySelector />
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
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  severityOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  severityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
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

export default CreatePunishmentScreen;