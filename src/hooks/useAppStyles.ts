import { StyleSheet } from 'react-native';
import { useTheme } from './useSimpleTheme';
import { AppSpacing, CommonStyles } from '../constants/spacing';

/**
 * Hook pour obtenir les styles de l'application avec les couleurs du thème
 */
export const useAppStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    // Container styles avec thème
    container: {
      ...CommonStyles.container,
      backgroundColor: theme.colors.background,
    },

    surface: {
      backgroundColor: theme.colors.surface,
    },

    // Header avec thème
    header: {
      ...CommonStyles.header,
      backgroundColor: theme.colors.surface,
    },

    headerTitle: {
      ...CommonStyles.headerTitle,
      color: theme.colors.text,
    },

    // Section styles avec thème
    section: CommonStyles.section,

    sectionTitle: {
      ...CommonStyles.sectionTitle,
      color: theme.colors.text,
    },

    sectionSubtitle: {
      ...CommonStyles.sectionSubtitle,
      color: theme.colors.textSecondary,
    },

    // Form styles avec thème
    textInput: {
      ...CommonStyles.textInput,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },

    textArea: {
      ...CommonStyles.textArea,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },

    // Button styles avec thème
    primaryButton: {
      ...CommonStyles.button,
      backgroundColor: theme.colors.primary,
    },

    secondaryButton: {
      ...CommonStyles.button,
      backgroundColor: theme.colors.secondary,
    },

    warningButton: {
      ...CommonStyles.button,
      backgroundColor: theme.colors.warning,
    },

    buttonText: CommonStyles.buttonText,

    // Card styles avec thème
    card: {
      ...CommonStyles.card,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },

    selectedCard: {
      ...CommonStyles.card,
      backgroundColor: `${theme.colors.primary}20`,
      borderColor: theme.colors.primary,
    },

    // Children grid avec thème
    childrenGrid: CommonStyles.childrenGrid,

    childCard: {
      ...CommonStyles.childCard,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },

    selectedChildCard: {
      ...CommonStyles.childCard,
      backgroundColor: `${theme.colors.primary}20`,
      borderColor: theme.colors.primary,
    },

    childAvatar: CommonStyles.childAvatar,

    childName: {
      ...CommonStyles.childName,
      color: theme.colors.text,
    },

    selectedBadge: {
      ...CommonStyles.selectedBadge,
      backgroundColor: theme.colors.primary,
    },

    // Navigation
    backButton: CommonStyles.backButton,

    // Spacing
    bottomPadding: CommonStyles.bottomPadding,

    // Content
    content: CommonStyles.content,
  });
};

/**
 * Hook pour les couleurs du thème avec opacité
 */
export const useThemedColors = () => {
  const theme = useTheme();
  
  return {
    ...theme.colors,
    primaryWithOpacity: (opacity: number) => `${theme.colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    secondaryWithOpacity: (opacity: number) => `${theme.colors.secondary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    warningWithOpacity: (opacity: number) => `${theme.colors.warning}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  };
};