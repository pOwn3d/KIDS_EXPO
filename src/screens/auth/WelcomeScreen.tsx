import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types and hooks
import { AuthStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';

type Props = AuthStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const platform = usePlatform();
  
  // Responsive values
  const containerPadding = useResponsive({
    mobile: 20,
    tablet: 40,
    desktop: 60,
  });

  const logoSize = useResponsive({
    mobile: 120,
    tablet: 160,
    desktop: 200,
  });

  const titleFontSize = useResponsive({
    mobile: 32,
    tablet: 40,
    desktop: 48,
  });

  const subtitleFontSize = useResponsive({
    mobile: 16,
    tablet: 18,
    desktop: 20,
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
    content: {
      flex: 1,
      paddingHorizontal: containerPadding,
      paddingVertical: containerPadding,
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: platform.isDesktop ? 600 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    logoContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    logo: {
      width: logoSize,
      height: logoSize,
      backgroundColor: theme.colors.primary,
      borderRadius: logoSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    logoText: {
      color: theme.colors.textInverse,
      fontSize: logoSize / 4,
      fontFamily: theme.typography.fontFamilies.bold,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: 60,
    },
    title: {
      fontSize: titleFontSize,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: subtitleFontSize,
      fontFamily: theme.typography.fontFamilies.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: subtitleFontSize * 1.5,
      maxWidth: platform.isDesktop ? 400 : '90%',
    },
    buttonsContainer: {
      width: '100%',
      maxWidth: platform.isDesktop ? 400 : '100%',
      gap: 16,
    },
    button: {
      height: buttonHeight,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 24,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    childButton: {
      backgroundColor: theme.colors.secondary,
    },
    buttonText: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
      marginLeft: 8,
    },
    primaryButtonText: {
      color: theme.colors.textInverse,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
    },
    childButtonText: {
      color: theme.colors.textInverse,
    },
    footer: {
      marginTop: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    linkText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamilies?.medium || theme.typography.fontFamily?.medium || 'System',
    },
  });

  const handleParentLogin = () => {
    navigation.navigate('Login', { userType: 'parent' });
  };

  const handleChildLogin = () => {
    navigation.navigate('Login', { userType: 'child' });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>KP</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Kids Points</Text>
            <Text style={styles.subtitle}>
              Turn everyday tasks into exciting adventures! 
              Earn points, unlock rewards, and grow together as a family.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Parent Login */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleParentLogin}
            accessibilityRole="button"
            accessibilityLabel="Parent Login"
            testID="parent-login-button"
          >
            <Ionicons 
              name="person-circle-outline" 
              size={24} 
              color={theme.colors.textInverse} 
            />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Parent Login
            </Text>
          </TouchableOpacity>

          {/* Child Login */}
          <TouchableOpacity
            style={[styles.button, styles.childButton]}
            onPress={handleChildLogin}
            accessibilityRole="button"
            accessibilityLabel="Child Login"
            testID="child-login-button"
          >
            <Ionicons 
              name="happy-outline" 
              size={24} 
              color={theme.colors.textInverse} 
            />
            <Text style={[styles.buttonText, styles.childButtonText]}>
              Child Login
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRegister}
            accessibilityRole="button"
            accessibilityLabel="Create New Account"
            testID="register-button"
          >
            <Ionicons 
              name="add-circle-outline" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;