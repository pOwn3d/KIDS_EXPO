import React, { useState } from 'react';
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
import { rewardsService } from '../../services/rewards.service';
import { AppSpacing, CommonStyles } from '../../constants/spacing';
import { Toast, useToast } from '../../components/ui/Toast';

interface RewardFormData {
  name: string;
  description: string;
  pointsCost: string;
  category: string;
  quantity?: string;
  expirationDate?: string;
}

const CreateRewardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    description: '',
    pointsCost: '',
    category: 'toy',
    quantity: '',
  });

  const categories = [
    { value: 'toy', label: 'Jouet', icon: '🎮' },
    { value: 'outing', label: 'Sortie', icon: '🎢' },
    { value: 'privilege', label: 'Privilège', icon: '⭐' },
    { value: 'gift', label: 'Cadeau', icon: '🎁' },
    { value: 'treat', label: 'Friandise', icon: '🍭' },
    { value: 'screen-time', label: 'Temps d\'écran', icon: '📱' },
    { value: 'special', label: 'Spécial', icon: '✨' },
    { value: 'other', label: 'Autre', icon: '🎯' },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la récompense');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    const points = parseInt(formData.pointsCost);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de points valide');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎁 Création de récompense:', formData);
      
      const result = await rewardsService.createReward({
        name: formData.name.trim(),
        description: formData.description.trim(),
        pointsCost: points,
        type: 'individual',  // Backend only accepts 'individual' or 'collective'
        icon: '🎁', // Default icon
        isActive: true,
        maxClaimsPerWeek: 5, // Default value
      });

      console.log('✅ Récompense créée avec succès:', result);

      // Afficher le toast de succès
      showToast('Récompense créée avec succès !', 'success');
      
      // Naviguer vers la liste après un délai pour voir le toast
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Erreur création récompense:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer la récompense. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
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
          Nouvelle récompense
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
            Nom de la récompense *
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
            placeholder="Ex: Sortie au cinéma"
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
            placeholder="Décrivez la récompense..."
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
            Coût en points *
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
            placeholder="Ex: 100"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.pointsCost}
            onChangeText={(text) => setFormData(prev => ({ ...prev, pointsCost: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        {/* Quantité */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quantité disponible (optionnel)
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
            placeholder="Ex: 5 (laisser vide pour illimité)"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.quantity}
            onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <CategorySelector />

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Toast */}
      {toast?.visible && (
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
  bottomPadding: CommonStyles.bottomPadding,
});

export default CreateRewardScreen;