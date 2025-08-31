/**
 * Migration Helper - Kids Points App
 * Facilite la transition vers le nouveau système de thèmes
 */

import { ThemeFactory, KidsPointsTheme } from './index-v2';
import { AppTheme } from '../types/app';

// Mapping des anciens noms vers les nouveaux
const THEME_MIGRATION_MAP = {
  // Anciens noms du système Box of Crayons
  'child-teen': 'child-child',
  'child-young': 'child-young', 
  'child-teen-aqua': 'child-child-aqua',
  'child-teen-fantasy': 'child-child-fantasy',
  'child-teen-space': 'child-child-space',
  'child-teen-jungle': 'child-child-jungle',
  'child-teen-candy': 'child-child-candy',
  'child-teen-volcano': 'child-child-volcano',
  'child-teen-ice': 'child-child-ice',
  'child-teen-rainbow': 'child-child-rainbow',
  
  // Thème parent
  'parent-professional': 'parent',
  
  // Legacy
  'light': 'child-child',
  'dark': 'child-child-space',
} as const;

// Adaptateur pour l'ancien interface AppTheme
export class ThemeAdapter {
  /**
   * Convertit un KidsPointsTheme vers l'ancienne interface AppTheme
   */
  static toAppTheme(newTheme: KidsPointsTheme): AppTheme {
    return {
      name: newTheme.metadata.name,
      mode: newTheme.mode,
      userAge: newTheme.ageGroup,
      worldTheme: newTheme.universeTheme,
      
      colors: {
        // Couleurs principales
        primary: newTheme.colors.primary,
        primaryDark: newTheme.colors.active,
        primaryLight: newTheme.colors.hover,
        secondary: newTheme.colors.secondary,
        secondaryDark: newTheme.colors.secondary,
        secondaryLight: newTheme.colors.secondary,
        accent: newTheme.colors.accent,
        
        // Backgrounds
        background: newTheme.colors.background,
        backgroundSecondary: newTheme.colors.backgroundSecondary,
        backgroundTertiary: newTheme.colors.backgroundTertiary,
        surface: newTheme.colors.surface,
        surfaceSecondary: newTheme.colors.backgroundSecondary,
        
        // Textes
        text: newTheme.colors.text,
        textSecondary: newTheme.colors.textSecondary,
        textTertiary: newTheme.colors.textTertiary,
        textInverse: newTheme.colors.textInverse,
        
        // Bordures
        border: newTheme.colors.border,
        borderLight: newTheme.colors.border,
        borderDark: newTheme.colors.borderStrong || newTheme.colors.border,
        
        // Statut
        success: newTheme.colors.success,
        warning: newTheme.colors.warning,
        error: newTheme.colors.error,
        info: newTheme.colors.info,
        
        // Gamification
        points: newTheme.colors.points,
        experience: newTheme.colors.experience,
        level: newTheme.colors.level,
        achievement: newTheme.colors.achievement,
        streak: newTheme.colors.streak,
        badge: newTheme.colors.badge,
        
        // États interactifs
        hover: newTheme.colors.hover,
        active: newTheme.colors.active,
        disabled: newTheme.colors.disabled,
        focus: newTheme.colors.focus,
      },
      
      typography: {
        // Nouvelle structure
        fontFamilies: newTheme.typography.fontFamilies,
        sizes: newTheme.typography.sizes,
        lineHeights: newTheme.typography.lineHeights,
        
        // Structure legacy pour compatibilité
        fontFamily: {
          regular: newTheme.typography.fontFamilies.regular,
          medium: newTheme.typography.fontFamilies.medium,
          bold: newTheme.typography.fontFamilies.bold,
          light: newTheme.typography.fontFamilies.light || newTheme.typography.fontFamilies.regular,
        },
        fontSize: {
          xs: newTheme.typography.sizes.xs,
          sm: newTheme.typography.sizes.sm,
          md: newTheme.typography.sizes.md,
          lg: newTheme.typography.sizes.lg,
          xl: newTheme.typography.sizes.xl,
          xxl: newTheme.typography.sizes['2xl'],
          xxxl: newTheme.typography.sizes['3xl'],
        },
        lineHeight: newTheme.typography.lineHeights,
      },
      
      spacing: {
        ...newTheme.spacing,
        // Compatibilité avec l'ancienne structure
        xs: newTheme.spacing.xs || 4,
        sm: newTheme.spacing.sm || 8,
        md: newTheme.spacing.md || 16,
        lg: newTheme.spacing.lg || 24,
        xl: newTheme.spacing.xl || 32,
      },
      
      borderRadius: newTheme.spacing.borderRadius,
      shadows: newTheme.effects.shadows,
      animations: {
        duration: newTheme.animations.durations.normal,
        durations: newTheme.animations.durations,
        easings: newTheme.animations.easings,
      },
      touchTargets: newTheme.spacing.touchTarget,
    };
  }

  /**
   * Migre un nom de thème ancien vers le nouveau système
   */
  static migrateThemeName(oldName: string): string {
    return THEME_MIGRATION_MAP[oldName as keyof typeof THEME_MIGRATION_MAP] || oldName;
  }

  /**
   * Crée un thème basé sur l'ancien nom
   */
  static createFromLegacyName(themeName: string): KidsPointsTheme {
    const migratedName = this.migrateThemeName(themeName);
    
    // Parse le nom migré
    const parts = migratedName.split('-');
    
    if (parts[0] === 'parent') {
      return ThemeFactory.createParentTheme();
    }
    
    if (parts[0] === 'child') {
      const ageGroup = (parts[1] || 'child') as 'young' | 'child' | 'teen';
      const universeTheme = parts[2] as any;
      
      return ThemeFactory.createChildTheme(ageGroup, universeTheme);
    }
    
    // Fallback
    return ThemeFactory.createChildTheme('child');
  }

  /**
   * Valide la compatibilité d'un thème legacy
   */
  static validateLegacyCompatibility(newTheme: KidsPointsTheme): {
    isCompatible: boolean;
    missingProperties: string[];
    recommendations: string[];
  } {
    const missingProperties: string[] = [];
    const recommendations: string[] = [];
    
    // Vérifier les propriétés requises par l'ancienne interface
    const appTheme = this.toAppTheme(newTheme);
    
    // Vérifications des propriétés critiques
    if (!appTheme.colors.primaryDark) {
      missingProperties.push('colors.primaryDark');
    }
    
    if (!appTheme.typography.fontFamily) {
      missingProperties.push('typography.fontFamily');
    }
    
    if (!appTheme.spacing.xs) {
      missingProperties.push('spacing.xs');
    }
    
    // Recommandations
    if (newTheme.metadata.accessibility.contrastRatio < 4.5) {
      recommendations.push('Améliorer le contraste pour une meilleure compatibilité');
    }
    
    if (newTheme.spacing.touchTarget.min < 44) {
      recommendations.push('Augmenter la taille des touch targets pour la compatibilité mobile');
    }
    
    return {
      isCompatible: missingProperties.length === 0,
      missingProperties,
      recommendations,
    };
  }
}

// Helper pour la migration automatique
export class AutoMigration {
  /**
   * Migre automatiquement les préférences stockées
   */
  static async migrateStoredPreferences(): Promise<void> {
    try {
      // React Native - localStorage
      if (typeof localStorage !== 'undefined') {
        const oldPrefs = localStorage.getItem('theme-preferences');
        
        if (oldPrefs) {
          const parsed = JSON.parse(oldPrefs);
          
          // Migrer vers le nouveau format
          const newPrefs = {
            mode: parsed.userRole || 'parent',
            ageGroup: parsed.childAge || 'child',
            universeTheme: parsed.worldTheme,
            isDarkMode: parsed.themeMode === 'dark',
            preferences: {
              reducedMotion: parsed.reducedMotion || false,
              highContrast: parsed.highContrast || false,
              fontSize: parsed.fontSize || 'normal',
            },
          };
          
          // Sauvegarder dans le nouveau format
          localStorage.setItem('kidspoints-theme-preferences', JSON.stringify(newPrefs));
          
          // Optionnel: supprimer l'ancien
          localStorage.removeItem('theme-preferences');
          
          console.log('✅ Theme preferences migrated successfully');
        }
      }
      
      // Alternative: AsyncStorage pour React Native pur
      // const AsyncStorage = require('@react-native-async-storage/async-storage');
      // const oldPrefs = await AsyncStorage.getItem('theme-preferences');
      // if (oldPrefs) { ... }
      
    } catch (error) {
      console.warn('Theme migration failed:', error);
    }
  }

  /**
   * Crée un rapport de migration
   */
  static generateMigrationReport(): {
    themesAvailable: number;
    compatibilityScore: number;
    recommendations: string[];
  } {
    const themes = [
      ThemeFactory.createParentTheme(),
      ThemeFactory.createChildTheme('young'),
      ThemeFactory.createChildTheme('child'),
      ThemeFactory.createChildTheme('teen'),
      ThemeFactory.createChildTheme('child', 'aqua'),
      ThemeFactory.createChildTheme('child', 'fantasy'),
      ThemeFactory.createChildTheme('child', 'space'),
    ];
    
    const validations = themes.map(theme => 
      ThemeAdapter.validateLegacyCompatibility(theme)
    );
    
    const compatibleCount = validations.filter(v => v.isCompatible).length;
    const compatibilityScore = Math.round((compatibleCount / themes.length) * 100);
    
    const allRecommendations = validations
      .flatMap(v => v.recommendations)
      .filter((rec, index, arr) => arr.indexOf(rec) === index); // Unique
    
    return {
      themesAvailable: themes.length,
      compatibilityScore,
      recommendations: allRecommendations,
    };
  }
}

// Exécuter la migration automatique au chargement
if (typeof window !== 'undefined') {
  AutoMigration.migrateStoredPreferences();
}

// Log du rapport de migration en développement
if (__DEV__) {
  const report = AutoMigration.generateMigrationReport();
  console.log('🔄 Theme Migration Report:', report);
}

export default ThemeAdapter;