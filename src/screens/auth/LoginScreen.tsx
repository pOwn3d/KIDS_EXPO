import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types and hooks
import { AuthStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';
import { useAuth } from '../../hooks';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userType = 'parent' } = route.params || {};
  const theme = useTheme();
  const platform = usePlatform();

  // Debug: Vérifier que le thème est bien chargé
  if (!theme || !theme.colors) {
    console.error('Theme not loaded properly:', theme);
    return null;
  }

  // Use our new auth hook
  const { login, isLoading, error, clearError } = useAuth();

  // Form state - Valeurs par défaut pour faciliter le développement
  const [formData, setFormData] = useState({
    email: __DEV__ ? 'parent@famille.com' : '',
    password: __DEV__ ? 'parent123' : '',
    childId: '',
    pin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

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
      backgroundColor: theme.colors.primary,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: platform.isDesktop ? 28 : 24,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      position: 'relative',
    },
    label: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
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
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.textInverse,
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
    },
    footer: {
      marginTop: 30,
      alignItems: 'center',
      gap: 16,
    },
    linkButton: {
      padding: 8,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
    },
    switchUserType: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      padding: 12,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.md,
    },
    switchUserTypeText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Clear any previous errors
      clearError();

      console.log('Starting login...', { userType, email: formData.email });

      if (userType === 'parent') {
        if (!formData.email || !formData.password) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }

        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        console.log('Login successful:', result);
        // La navigation devrait se faire automatiquement via RootNavigator
      } else {
        // Note: Child login functionality would need to be added to the useAuth hook
        // For now, show a message about this feature being in development
        Alert.alert('Fonctionnalité en développement', 'La connexion enfant sera disponible bientôt');
      }
    } catch (error: any) {
      // Error is handled by Redux state through our hook
      console.error('Login error:', error);
      Alert.alert('Erreur de connexion', error?.message || 'Impossible de se connecter');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const switchUserType = () => {
    const newUserType = userType === 'parent' ? 'child' : 'parent';
    navigation.setParams({ userType: newUserType });
    setFormData({ email: '', password: '', childId: '', pin: '' });
  };

  const isFormValid = userType === 'parent'
    ? formData.email && formData.password
    : formData.email && formData.childId && formData.pin;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios'
          ? (Platform.isPad ? 'padding' : 'position')
          : 'height'
        }
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
                    name={userType === 'parent' ? 'person-circle' : 'happy'}
                    size={40}
                    color={theme.colors.textInverse}
                  />
                </View>
                <Text style={styles.title}>
                  {userType === 'parent' ? 'Parent Login' : 'Child Login'}
                </Text>
                <Text style={styles.subtitle}>
                  {userType === 'parent'
                    ? 'Sign in to manage your family'
                    : 'Enter your details to continue'
                  }
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {userType === 'parent' ? 'Email' : 'Parent Email'}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      error ? styles.inputError : null,
                    ] as any}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder={userType === 'parent' ? 'Enter your email' : 'Enter parent\'s email'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    accessible
                    accessibilityLabel="Email input"
                  />
                </View>

                {userType === 'parent' ? (
                  /* Password for Parent */
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          error ? styles.inputError : null,
                        ] as any}
                        value={formData.password}
                        onChangeText={(text) => handleInputChange('password', text)}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        accessible
                        accessibilityLabel="Password input"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={24}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* Child ID and PIN */
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Child ID</Text>
                      <TextInput
                        style={[styles.input, error ? styles.inputError : null] as any}
                        value={formData.childId}
                        onChangeText={(text) => handleInputChange('childId', text)}
                        placeholder="Enter your child ID"
                        autoCapitalize="none"
                        accessible
                        accessibilityLabel="Child ID input"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>PIN</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.passwordInput,
                            error ? styles.inputError : null,
                          ] as any}
                          value={formData.pin}
                          onChangeText={(text) => handleInputChange('pin', text)}
                          placeholder="Enter your PIN"
                          secureTextEntry={!showPin}
                          keyboardType="numeric"
                          maxLength={6}
                          accessible
                          accessibilityLabel="PIN input"
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPin(!showPin)}
                          accessibilityLabel={showPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          <Ionicons
                            name={showPin ? 'eye-off-outline' : 'eye-outline'}
                            size={24}
                            color={theme.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

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
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                {userType === 'parent' && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleForgotPassword}
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                  >
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                {/* Switch User Type */}
                <TouchableOpacity
                  style={styles.switchUserType}
                  onPress={switchUserType}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${userType === 'parent' ? 'child' : 'parent'} login`}
                >
                  <Text style={styles.switchUserTypeText}>
                    {userType === 'parent' ? 'Child login instead?' : 'Parent login instead?'}
                  </Text>
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
