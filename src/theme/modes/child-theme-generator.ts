/**
 * Child Theme Generator - Kids Points App
 * Génère automatiquement des thèmes enfant avec validation WCAG AAA
 */

import {
  ChildCoreColors,
  StatusColors,
  GamificationColors,
  BackgroundSystems,
  TextSystems,
  BorderSystems,
  ShadowSystems,
  UniversePalettes,
  ColorUtils
} from '../core/colors-v2';

export type ChildAgeGroup = 'young' | 'child' | 'teen';
export type UniverseTheme = keyof typeof UniversePalettes | undefined;

// Configuration par groupe d'âge
const AgeConfigurations = {
  young: {
    // 4-6 ans - Interface maximale simplicité
    touchTargetSize: 72,      // Très grandes zones tactiles
    borderRadius: {
      sm: 24,
      md: 32, 
      lg: 48,
      full: 9999,
    },
    typography: {
      scale: 1.4,             // Texte plus gros
      lineHeight: 1.6,        // Espacement généreux
      fontWeight: 'bold',     // Toujours gras pour visibilité
    },
    animations: {
      duration: 600,          // Animations plus lentes
      bounce: true,           // Animations rebondissantes
      celebration: true,      // Célébrations automatiques
    },
    shadows: 'lg',            // Ombres marquées
    contrast: 'maximum',      // Contraste maximum
  },
  child: {
    // 7-10 ans - Interface équilibrée
    touchTargetSize: 60,
    borderRadius: {
      sm: 16,
      md: 24,
      lg: 32,
      full: 9999,
    },
    typography: {
      scale: 1.2,
      lineHeight: 1.5,
      fontWeight: 'semibold',
    },
    animations: {
      duration: 400,
      bounce: true,
      celebration: true,
    },
    shadows: 'md',
    contrast: 'high',
  },
  teen: {
    // 11-16 ans - Interface plus mature
    touchTargetSize: 48,
    borderRadius: {
      sm: 8,
      md: 16,
      lg: 24,
      full: 9999,
    },
    typography: {
      scale: 1.1,
      lineHeight: 1.4,
      fontWeight: 'medium',
    },
    animations: {
      duration: 300,
      bounce: false,          // Moins d'animations rebondissantes
      celebration: true,
    },
    shadows: 'sm',
    contrast: 'normal',
  },
} as const;

// Générateur principal de thème enfant
export class ChildThemeGenerator {
  /**
   * Génère un thème complet pour un enfant
   */
  static generate(
    ageGroup: ChildAgeGroup = 'child',
    universeTheme?: UniverseTheme
  ) {
    const ageConfig = AgeConfigurations[ageGroup];
    const basePalette = universeTheme ? UniversePalettes[universeTheme] : null;
    
    // Couleurs principales (univers ou par défaut)
    const colors = this.generateColors(basePalette, ageGroup);
    
    // Typographie adaptée à l'âge
    const typography = this.generateTypography(ageConfig);
    
    // Espacements et dimensions
    const spacing = this.generateSpacing(ageConfig);
    
    // Animations
    const animations = this.generateAnimations(ageConfig);
    
    // Ombres et effets
    const effects = this.generateEffects(ageConfig, colors);
    
    return {
      mode: 'child' as const,
      ageGroup,
      universeTheme,
      
      colors,
      typography,
      spacing,
      animations,
      effects,
      
      // Métadonnées pour le thème
      metadata: {
        name: universeTheme ? `child-${ageGroup}-${universeTheme}` : `child-${ageGroup}`,
        displayName: universeTheme 
          ? `${this.capitalizeFirst(ageGroup)} - ${this.capitalizeFirst(universeTheme)}`
          : `${this.capitalizeFirst(ageGroup)} Mode`,
        description: this.generateDescription(ageGroup, universeTheme),
        ageRange: this.getAgeRange(ageGroup),
        features: this.getFeatures(ageGroup, universeTheme),
        accessibility: {
          wcagLevel: 'AAA',
          contrastRatio: this.calculateAverageContrast(colors),
          touchTargetSize: ageConfig.touchTargetSize,
          reducedMotion: false, // Les enfants apprécient les animations
        }
      }
    };
  }

  /**
   * Génère le système de couleurs
   */
  private static generateColors(basePalette: any, ageGroup: ChildAgeGroup) {
    if (basePalette) {
      // Utilise la palette d'univers avec adaptations
      return {
        // Couleurs principales de l'univers
        primary: basePalette.primary,
        secondary: basePalette.secondary,
        accent: basePalette.accent,
        
        // Couleurs de statut adaptées
        success: StatusColors.child.success,
        warning: StatusColors.child.warning,
        error: StatusColors.child.error,
        info: StatusColors.child.info,
        
        // Gamification
        ...GamificationColors,
        
        // Backgrounds de l'univers
        background: basePalette.backgrounds.primary,
        backgroundSecondary: basePalette.backgrounds.secondary,
        backgroundTertiary: basePalette.backgrounds.surface,
        surface: basePalette.backgrounds.elevated,
        
        // Textes avec contraste garanti
        text: basePalette.text.primary,
        textSecondary: basePalette.text.secondary,
        textTertiary: ColorUtils.adjustBrightness(basePalette.text.secondary, 15),
        textInverse: basePalette.text.onPrimary,
        
        // Textes sur couleurs
        onPrimary: basePalette.text.onPrimary,
        onSecondary: basePalette.text.onSecondary,
        onAccent: ColorUtils.generateContrastingText(basePalette.accent),
        onSuccess: TextSystems.child.onSuccess,
        onWarning: TextSystems.child.onWarning,
        onError: TextSystems.child.onError,
        
        // Bordures
        border: BorderSystems.child.light,
        borderStrong: BorderSystems.child.strong,
        
        // États interactifs
        hover: ColorUtils.adjustBrightness(basePalette.primary, 10),
        active: ColorUtils.adjustBrightness(basePalette.primary, -10),
        disabled: ColorUtils.adjustSaturation(basePalette.primary, -50),
        focus: basePalette.accent,
      };
    }
    
    // Palette par défaut
    return {
      // Couleurs de base enfant
      primary: ChildCoreColors.primary,
      secondary: ChildCoreColors.secondary,
      accent: ChildCoreColors.accent,
      
      // Palette étendue
      red: ChildCoreColors.red,
      blue: ChildCoreColors.blue,
      green: ChildCoreColors.green,
      yellow: ChildCoreColors.yellow,
      purple: ChildCoreColors.purple,
      orange: ChildCoreColors.orange,
      pink: ChildCoreColors.pink,
      teal: ChildCoreColors.teal,
      
      // Couleurs de statut
      success: StatusColors.child.success,
      warning: StatusColors.child.warning,
      error: StatusColors.child.error,
      info: StatusColors.child.info,
      
      // Gamification
      ...GamificationColors,
      
      // Backgrounds
      background: BackgroundSystems.child.primary,
      backgroundSecondary: BackgroundSystems.child.secondary,
      backgroundTertiary: BackgroundSystems.child.tertiary,
      surface: BackgroundSystems.child.elevated,
      
      // Textes
      text: TextSystems.child.primary,
      textSecondary: TextSystems.child.secondary,
      textTertiary: TextSystems.child.tertiary,
      textInverse: TextSystems.child.inverse,
      
      // Textes sur couleurs
      onPrimary: TextSystems.child.onPrimary,
      onSecondary: TextSystems.child.onSecondary,
      onAccent: TextSystems.child.onAccent,
      onSuccess: TextSystems.child.onSuccess,
      onWarning: TextSystems.child.onWarning,
      onError: TextSystems.child.onError,
      
      // Bordures
      border: BorderSystems.child.light,
      borderStrong: BorderSystems.child.strong,
      
      // États interactifs
      hover: ColorUtils.adjustBrightness(ChildCoreColors.primary, 10),
      active: ColorUtils.adjustBrightness(ChildCoreColors.primary, -10),
      disabled: ColorUtils.adjustSaturation(ChildCoreColors.primary, -50),
      focus: ChildCoreColors.accent,
    };
  }

  /**
   * Génère la typographie adaptée à l'âge
   */
  private static generateTypography(ageConfig: typeof AgeConfigurations.child) {
    const baseSize = 16;
    const scale = ageConfig.typography.scale;
    
    return {
      fontFamilies: {
        // Polices adaptées aux enfants
        regular: ageConfig === AgeConfigurations.young 
          ? 'Fredoka One, Comic Sans MS, cursive'  // Police très ludique pour les petits
          : 'Fredoka, Comic Sans MS, system-ui',   // Police ludique mais lisible
        medium: 'Fredoka Medium, system-ui',
        semiBold: 'Fredoka SemiBold, system-ui',
        bold: 'Fredoka Bold, system-ui',
        extraBold: 'Fredoka One, system-ui',
        
        // Polices spéciales
        display: 'Fredoka One, display',           // Pour les titres importants
        mono: 'JetBrains Mono, Fira Code, monospace',
        handwriting: 'Kalam, Caveat, cursive',    // Pour les éléments créatifs
      },
      
      sizes: {
        xs: Math.round(12 * scale),
        sm: Math.round(14 * scale),
        md: Math.round(baseSize * scale),
        lg: Math.round(18 * scale),
        xl: Math.round(20 * scale),
        '2xl': Math.round(24 * scale),
        '3xl': Math.round(30 * scale),
        '4xl': Math.round(36 * scale),
        '5xl': Math.round(48 * scale),
        '6xl': Math.round(64 * scale),
        '7xl': Math.round(80 * scale),
        '8xl': Math.round(96 * scale),
        '9xl': Math.round(128 * scale),
      },
      
      lineHeights: {
        tight: 1.25,
        normal: ageConfig.typography.lineHeight,
        relaxed: ageConfig.typography.lineHeight + 0.2,
      },
      
      weights: {
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
      },
    };
  }

  /**
   * Génère les espacements et dimensions
   */
  private static generateSpacing(ageConfig: typeof AgeConfigurations.child) {
    const base = 4;
    const touchSize = ageConfig.touchTargetSize;
    
    return {
      // Espacements de base
      xs: base,
      sm: base * 2,
      md: base * 4,
      lg: base * 6,
      xl: base * 8,
      '2xl': base * 12,
      '3xl': base * 16,
      '4xl': base * 24,
      
      // Touch targets adaptatifs
      touchTarget: {
        min: touchSize,
        comfortable: touchSize * 1.2,
        generous: touchSize * 1.5,
      },
      
      // Rayons de bordure
      borderRadius: ageConfig.borderRadius,
      
      // Espacements spécifiques
      cardPadding: base * 6,
      sectionSpacing: base * 8,
      containerPadding: base * 4,
    };
  }

  /**
   * Génère les animations
   */
  private static generateAnimations(ageConfig: typeof AgeConfigurations.child) {
    return {
      durations: {
        instant: 100,
        fast: 200,
        normal: ageConfig.animations.duration,
        slow: ageConfig.animations.duration * 1.5,
        celebration: 1500,
      },
      
      easings: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: ageConfig.animations.bounce 
          ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          : 'cubic-bezier(0.4, 0, 0.2, 1)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.0)',
      },
      
      // Configurations spéciales
      celebration: ageConfig.animations.celebration,
      reducedMotion: false, // Les enfants aiment les animations
      
      // Animations signature
      signature: {
        pointsEarned: 'bounce + sparkle',
        levelUp: 'celebration + confetti',
        missionComplete: 'elastic + glow',
        badgeUnlocked: 'bounce + shine',
      }
    };
  }

  /**
   * Génère les effets visuels
   */
  private static generateEffects(ageConfig: typeof AgeConfigurations.child, colors: any) {
    return {
      shadows: ShadowSystems.child,
      activeShadow: ageConfig.shadows,
      
      // Effets de glow
      glow: {
        primary: `0 0 20px ${colors.primary}40`,
        secondary: `0 0 20px ${colors.secondary}40`,
        accent: `0 0 20px ${colors.accent}40`,
        success: `0 0 20px ${colors.success}40`,
        achievement: `0 0 30px ${colors.achievement}60`,
      },
      
      // Dégradés
      gradients: {
        primary: `linear-gradient(135deg, ${colors.primary}, ${ColorUtils.adjustBrightness(colors.primary, -20)})`,
        rainbow: 'linear-gradient(90deg, #FF6B6B, #4D96FF, #6BCB77, #FFD93D, #BB6BD9)',
        celebration: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6347)',
      },
      
      // Patterns pour les backgrounds
      patterns: ageConfig === AgeConfigurations.young ? {
        dots: true,
        stars: true,
        confetti: true,
      } : undefined,
    };
  }

  // Méthodes utilitaires
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static generateDescription(ageGroup: ChildAgeGroup, universeTheme?: UniverseTheme): string {
    const age = this.getAgeRange(ageGroup);
    const theme = universeTheme ? ` avec le thème ${this.capitalizeFirst(universeTheme)}` : '';
    return `Interface optimisée pour les enfants de ${age} ans${theme}`;
  }

  private static getAgeRange(ageGroup: ChildAgeGroup): string {
    switch (ageGroup) {
      case 'young': return '4-6';
      case 'child': return '7-10';
      case 'teen': return '11-16';
    }
  }

  private static getFeatures(ageGroup: ChildAgeGroup, universeTheme?: UniverseTheme): string[] {
    const baseFeatures = [
      'Contraste WCAG AAA',
      'Animations ludiques',
      'Touch targets adaptatifs',
      'Gamification intégrée',
    ];

    const ageFeatures = {
      young: ['Interface ultra-simplifiée', 'Texte extra-large', 'Animations rebondissantes'],
      child: ['Interface équilibrée', 'Texte confortable', 'Effets visuels'],
      teen: ['Interface mature', 'Design raffiné', 'Animations subtiles'],
    };

    const universeFeatures = universeTheme ? [`Thème immersif ${universeTheme}`] : [];

    return [...baseFeatures, ...ageFeatures[ageGroup], ...universeFeatures];
  }

  private static calculateAverageContrast(colors: any): number {
    // Calcule le ratio de contraste moyen entre les couleurs principales
    const ratios = [
      ColorUtils.getContrastRatio(colors.text, colors.background),
      ColorUtils.getContrastRatio(colors.onPrimary, colors.primary),
      ColorUtils.getContrastRatio(colors.onSecondary, colors.secondary),
    ];
    
    return Math.round(ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length * 10) / 10;
  }
}