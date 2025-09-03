import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { childrenService } from '../../services/children.service';

const AddChildScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');

  const avatarOptions = ['👦', '👧', '🧒', '👶'];

  const handleSave = async () => {
    
    // Validation
    if (!firstName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Le prénom est obligatoire');
      } else {
        Alert.alert('Erreur', 'Le prénom est obligatoire');
      }
      return;
    }

    if (!lastName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Le nom est obligatoire');
      } else {
        Alert.alert('Erreur', 'Le nom est obligatoire');
      }
      return;
    }

    const year = parseInt(birthYear);
    if (!birthYear || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez entrer une année de naissance valide');
      } else {
        Alert.alert('Erreur', 'Veuillez entrer une année de naissance valide');
      }
      return;
    }

    try {
      setIsLoading(true);
      
      // Calculer la date de naissance (1er janvier de l'année)
      const birthDate = `${year}-01-01`;
      
      const childData = {
        name: `${firstName.trim()} ${lastName.trim()}`,
        avatar: selectedAvatar,
        age: calculateAge(), // L'API attend l'âge, pas la date de naissance
      };

      
      const result = await childrenService.createChild(childData);
      
      
      if (Platform.OS === 'web') {
        window.alert('Enfant ajouté avec succès !');
      } else {
        Alert.alert('Succès', 'Enfant ajouté avec succès !');
      }
      
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.message || 'Impossible d\'ajouter l\'enfant';
      
      if (Platform.OS === 'web') {
        window.alert(`Erreur: ${errorMessage}`);
      } else {
        Alert.alert('Erreur', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = () => {
    const year = parseInt(birthYear);
    if (!isNaN(year)) {
      return new Date().getFullYear() - year;
    }
    return 0;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    formSection: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    avatarSection: {
      marginBottom: 24,
    },
    avatarGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    avatarOption: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    avatarSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    avatarEmoji: {
      fontSize: 32,
    },
    ageInfo: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    saveButtonText: {
      color: '#FFFFFF',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un Enfant</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulaire */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Entrez le prénom"
            placeholderTextColor={theme.colors.textLight}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Entrez le nom"
            placeholderTextColor={theme.colors.textLight}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Année de naissance *</Text>
          <TextInput
            style={styles.input}
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder="Ex: 2015"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="numeric"
            maxLength={4}
          />
          {birthYear && !isNaN(parseInt(birthYear)) && (
            <Text style={styles.ageInfo}>
              Âge : {calculateAge()} ans
            </Text>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Text style={styles.label}>Choisir un avatar</Text>
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar && styles.avatarSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar)}
              >
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Annuler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Ajouter
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddChildScreen;