import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';
import { useAuth } from '../../hooks';
import { AnimatedCard } from '../../components/ui';

type Props = AuthStackScreenProps<'Invitation'>;

const InvitationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { invitationToken } = route.params || {};
  const theme = useTheme();
  const platform = usePlatform();
  
  const { 
    validateInvitationToken,
    invitationValid,
    invitationData,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [validating, setValidating] = useState(true);
  const [invitationInfo, setInvitationInfo] = useState<any>(null);

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

  const buttonHeight = useResponsive({
    mobile: 50,
    tablet: 56,
    desktop: 60,
  });

  // Validate invitation token on mount
  useEffect(() => {
    if (invitationToken) {
      validateInvitation();
    } else {
      // No invitation token, redirect to regular registration
      navigation.replace('Register', {});
    }
  }, [invitationToken]);

  // Update invitation info when data changes
  useEffect(() => {
    if (invitationValid && invitationData) {
      setInvitationInfo(invitationData);
    }
  }, [invitationValid, invitationData]);

  const validateInvitation = async () => {
    try {
      setValidating(true);
      clearError();
      await validateInvitationToken(invitationToken).unwrap();
      setValidating(false);
    } catch (error: any) {
      setValidating(false);
      Alert.alert(
        'Invitation invalide', 
        error.message || 'Le lien d\'invitation n\'est pas valide ou a expiré.',
        [
          {
            text: 'Retour à l\'accueil',
            onPress: () => navigation.navigate('Welcome'),
          },
        ]
      );
    }
  };

  const handleAcceptInvitation = () => {
    // Navigate to registration with invitation token
    navigation.navigate('Register', { invitationToken });
  };

  const handleDeclineInvitation = () => {
    Alert.alert(
      'Refuser l\'invitation',
      'Êtes-vous sûr de vouloir refuser cette invitation ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => navigation.navigate('Welcome'),
        },
      ]
    );
  };

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
    loadingContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
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
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    invitationCard: {
      padding: 24,
      marginBottom: 30,
    },
    invitationTitle: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    invitationDetails: {
      alignItems: 'center',
      marginBottom: 20,
    },
    familyName: {
      fontSize: 22,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    invitedBy: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    parentName: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.text,
      textAlign: 'center',
    },
    invitationMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 16,
    },
    metaItem: {
      alignItems: 'center',
    },
    metaLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    metaValue: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.text,
    },
    buttonsContainer: {
      gap: 16,
    },
    button: {
      height: buttonHeight,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      marginLeft: 8,
    },
    primaryButtonText: {
      color: theme.colors.textInverse,
    },
    secondaryButtonText: {
      color: theme.colors.text,
    },
    errorContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    errorIcon: {
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 20,
      fontFamily: theme.typography.fontFamilies?.bold || 'System',
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  // Show loading while validating
  if (validating) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  Validation de l'invitation...
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !invitationValid || !invitationInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Ionicons
                    name="alert-circle"
                    size={64}
                    color={theme.colors.error}
                  />
                </View>
                <Text style={styles.errorTitle}>
                  Invitation invalide
                </Text>
                <Text style={styles.errorMessage}>
                  {error || 'Cette invitation n\'est pas valide ou a expiré.'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate('Welcome')}
              >
                <Ionicons name="home" size={20} color={theme.colors.textInverse} />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Retour à l'accueil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show valid invitation
  return (
    <SafeAreaView style={styles.container}>
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
                  name="mail-open"
                  size={40}
                  color={theme.colors.textInverse}
                />
              </View>
              <Text style={styles.title}>
                Invitation reçue !
              </Text>
              <Text style={styles.subtitle}>
                Vous avez été invité(e) à rejoindre une famille
              </Text>
            </View>

            {/* Invitation Details */}
            <AnimatedCard style={styles.invitationCard}>
              <Text style={styles.invitationTitle}>
                Rejoindre la famille
              </Text>
              
              <View style={styles.invitationDetails}>
                <Text style={styles.familyName}>
                  {invitationInfo.familyName}
                </Text>
                
                <Text style={styles.invitedBy}>
                  Invité(e) par
                </Text>
                <Text style={styles.parentName}>
                  {invitationInfo.parentName}
                </Text>
              </View>

              {/* Metadata */}
              <View style={styles.invitationMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Type</Text>
                  <Text style={styles.metaValue}>
                    {invitationInfo.role === 'child' ? 'Enfant' : 'Adulte'}
                  </Text>
                </View>
                {invitationInfo.expiresAt && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Expire le</Text>
                    <Text style={styles.metaValue}>
                      {new Date(invitationInfo.expiresAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                )}
              </View>
            </AnimatedCard>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleAcceptInvitation}
                disabled={isLoading}
              >
                <Ionicons name="checkmark" size={20} color={theme.colors.textInverse} />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Accepter l'invitation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleDeclineInvitation}
                disabled={isLoading}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Refuser
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvitationScreen;