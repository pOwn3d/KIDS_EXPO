import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';
import { useAuth } from '../../hooks';

type Props = AuthStackScreenProps<'Register'>;

const RegisterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { invitationToken } = route.params || {};
  const theme = useTheme();
  const platform = usePlatform();
  
  const { 
    register, 
    registerWithInvitation, 
    validateInvitationToken,
    isLoading, 
    error, 
    clearError,
    invitationValid,
    invitationData,
  } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingInvitation, setValidatingInvitation] = useState(false);

  // Responsive values
  const containerPadding = useResponsive({
    mobile: 20,
    tablet: 40,
    desktop: 60,
  });

  const maxWidth = useResponsive({
    mobile: '100%',
    tablet: '500' as any,
    desktop: '400' as any,
  });

  const inputHeight = useResponsive({
    mobile: 50,
    tablet: 56,
    desktop: 60,
  });

  const buttonHeight = useResponsive({
    mobile: 50,
    tablet: 56,
    desktop: 60,
  });

  // Validate invitation token on mount
  useEffect(() => {
    if (invitationToken) {
      validateInvitationOnMount();
    }
  }, [invitationToken]);

  const validateInvitationOnMount = async () => {
    try {
      setValidatingInvitation(true);
      await validateInvitationToken(invitationToken).unwrap();
    } catch (error: any) {
      Alert.alert(
        'Invitation invalide', 
        error.message || 'Le lien d\'invitation n\'est pas valide.',
        [
          {
            text: 'Retour',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setValidatingInvitation(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Erreur', 'Le mot de passe est obligatoire');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      
      if (invitationToken && invitationValid) {
        // Registration with invitation
        const result = await registerWithInvitation({
          invitationToken,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }).unwrap();
        
        Alert.alert(
          'Inscription réussie !', 
          'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'Continuer',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        // Regular registration
        const result = await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }).unwrap();
        
        Alert.alert(
          'Inscription réussie !', 
          'Votre compte a été créé avec succès.',
          [
            {
              text: 'Continuer',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Erreur d\'inscription', error?.message || 'Impossible de créer le compte');
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.password && formData.confirmPassword &&
                     formData.password === formData.confirmPassword;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: containerPadding,
      paddingVertical: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formContainer: {
      width: '100%',
      maxWidth: maxWidth as any,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    icon: {
      width: 80,
      height: 80,
      backgroundColor: theme.colors.secondary,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: platform.isDesktop ? 28 : 24,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    invitationInfo: {
      backgroundColor: theme.colors.secondary + '20',
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    invitationText: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },
    form: {
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    inputContainer: {
      flex: 1,
      position: 'relative',
    },
    label: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      height: inputHeight,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      paddingRight: 50,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      height: inputHeight,
      justifyContent: 'center',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    button: {
      height: buttonHeight,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      flexDirection: 'row',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.textInverse,
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      marginLeft: 8,
    },
    footer: {
      marginTop: 30,
      alignItems: 'center',
    },
    linkButton: {
      padding: 8,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  // Show loading screen while validating invitation
  if (validatingInvitation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Validation de l'invitation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.formContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.icon}>
                  <Ionicons
                    name="person-add"
                    size={40}
                    color={theme.colors.textInverse}
                  />
                </View>
                <Text style={styles.title}>
                  {invitationToken ? 'Rejoindre la Famille' : 'Créer un Compte'}
                </Text>
                <Text style={styles.subtitle}>
                  {invitationToken 
                    ? 'Complétez votre profil pour rejoindre la famille'
                    : 'Créez votre compte pour commencer'
                  }
                </Text>
              </View>

              {/* Invitation Info */}
              {invitationToken && invitationValid && invitationData && (
                <View style={styles.invitationInfo}>
                  <Text style={styles.invitationText}>
                    Vous avez été invité(e) à rejoindre la famille {invitationData.familyName} 
                    par {invitationData.parentName}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                {/* Name Row */}
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput
                      style={[
                        styles.input,
                        error ? styles.inputError : null,
                      ] as any}
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                      placeholder="Votre prénom"
                      autoCapitalize="words"
                      textContentType="givenName"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                      style={[
                        styles.input,
                        error ? styles.inputError : null,
                      ] as any}
                      value={formData.lastName}
                      onChangeText={(text) => handleInputChange('lastName', text)}
                      placeholder="Votre nom"
                      autoCapitalize="words"
                      textContentType="familyName"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      error ? styles.inputError : null,
                    ] as any}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        error ? styles.inputError : null,
                      ] as any}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      placeholder="Minimum 8 caractères"
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        error ? styles.inputError : null,
                      ] as any}
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                      placeholder="Confirmez votre mot de passe"
                      secureTextEntry={!showConfirmPassword}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!isFormValid || isLoading) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading && (
                    <ActivityIndicator size="small" color={theme.colors.textInverse} />
                  )}
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Création...' : 'Créer le compte'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.linkText}>
                    Déjà un compte ? Se connecter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;