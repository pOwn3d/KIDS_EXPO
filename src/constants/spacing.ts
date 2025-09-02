import { Platform } from 'react-native';

/**
 * Système d'espacement uniforme pour l'application
 */
export const AppSpacing = {
  // Espacements de base
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Padding pour les containers principaux
  container: {
    horizontal: Platform.OS === 'web' ? 40 : 20,
    vertical: 16,
  },

  // Padding pour les headers
  header: {
    horizontal: Platform.OS === 'web' ? 40 : 20,
    vertical: 16,
  },

  // Margins pour les sections
  section: {
    vertical: 16,
    horizontal: 0,
  },

  // Espacement pour les formulaires
  form: {
    fieldSpacing: 16,
    buttonSpacing: 24,
  },

  // Espacement pour les cartes et composants
  card: {
    padding: 16,
    margin: 8,
  },

  // Espacement pour les grilles
  grid: {
    gap: 12,
    itemSpacing: Platform.OS === 'web' ? 12 : '2%',
  },

  // Bottom padding pour éviter le clipping
  bottom: 40,
};

/**
 * Styles constants pour les composants récurrents
 */
export const CommonStyles = {
  // Header styles
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: AppSpacing.header.horizontal,
    paddingVertical: AppSpacing.header.vertical,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Container styles
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: AppSpacing.container.horizontal,
  },

  // Section styles
  section: {
    marginVertical: AppSpacing.section.vertical,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },

  // Form styles
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

  // Button styles
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },

  // Card styles
  card: {
    padding: AppSpacing.card.padding,
    margin: AppSpacing.card.margin,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Navigation styles
  backButton: {
    padding: 8,
  },

  // Bottom padding
  bottomPadding: {
    height: AppSpacing.bottom,
  },

  // Grid styles
  childrenGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: 8,
  },

  childCard: {
    width: Platform.OS === 'web' ? 200 : '48%',
    marginRight: Platform.OS === 'web' ? 12 : '2%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },

  selectedBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Typography
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: 16,
  },

  // Avatar styles
  childAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },

  childName: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
};