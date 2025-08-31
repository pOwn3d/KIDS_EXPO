/**
 * Parent Theme Generator - Kids Points App
 * Interface professionnelle pour les parents avec accessibilité maximale
 */

import {
  ParentCoreColors,
  StatusColors,
  GamificationColors,
  BackgroundSystems,
  TextSystems,
  BorderSystems,
  ShadowSystems,
  ColorUtils
} from '../core/colors-v2';

// Configuration parent optimisée
const ParentConfiguration = {
  touchTargetSize: 44,          // Standard mobile (44px minimum iOS/Android)
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    scale: 1.0,                 // Taille standard
    lineHeight: 1.5,            // Lisibilité optimale
    fontWeight: 'normal',       // Professional
  },
  animations: {
    duration: 200,              // Animations rapides et efficaces
    bounce: false,              // Pas d'animations rebondissantes
    celebration: false,         // Feedback discret
  },
  shadows: 'sm',               // Ombres subtiles
  contrast: 'maximum',         // Contraste maximal pour productivité
} as const;

// Générateur de thème parent
export class ParentThemeGenerator {
  /**
   * Génère un thème professionnel pour les parents
   */
  static generate() {
    const config = ParentConfiguration;
    
    // Couleurs professionnelles
    const colors = this.generateColors();
    
    // Typographie lisible et professionnelle
    const typography = this.generateTypography(config);
    
    // Espacements efficaces
    const spacing = this.generateSpacing(config);
    
    // Animations discrètes
    const animations = this.generateAnimations(config);
    
    // Effets sobres
    const effects = this.generateEffects(colors);
    
    return {
      mode: 'parent' as const,
      
      colors,
      typography,
      spacing,
      animations,
      effects,
      
      // Métadonnées
      metadata: {
        name: 'parent-professional',
        displayName: 'Mode Parent',
        description: 'Interface professionnelle optimisée pour la gestion et la supervision',
        target: 'Parents et superviseurs',
        features: this.getFeatures(),
        accessibility: {
          wcagLevel: 'AAA',
          contrastRatio: this.calculateAverageContrast(colors),
          touchTargetSize: config.touchTargetSize,
          reducedMotion: true, // Peut être activé par préférence utilisateur
          screenReader: true,  // Support complet
          keyboardNavigation: true,
          highContrast: true,
        },
        productivity: {
          optimizedForScanning: true,    // Tables et listes optimisées
          quickActions: true,            // Actions rapides accessibles
          densityOptions: ['comfortable', 'compact'], // Densité ajustable
          keyboardShortcuts: true,       // Raccourcis clavier
        }
      }
    };
  }

  /**
   * Génère le système de couleurs parent
   */
  private static generateColors() {
    return {
      // Couleurs principales professionnelles
      primary: ParentCoreColors.primary,
      secondary: ParentCoreColors.secondary,
      accent: ParentCoreColors.accent,
      
      // Couleurs de statut
      success: StatusColors.parent.success,
      warning: StatusColors.parent.warning,
      error: StatusColors.parent.error,
      info: StatusColors.parent.info,
      
      // Gamification (plus discrète)
      points: ColorUtils.adjustSaturation(GamificationColors.points, -20),
      experience: ColorUtils.adjustSaturation(GamificationColors.experience, -20),
      level: ColorUtils.adjustSaturation(GamificationColors.level, -20),
      achievement: ColorUtils.adjustSaturation(GamificationColors.achievement, -20),
      streak: ColorUtils.adjustSaturation(GamificationColors.streak, -20),
      badge: ColorUtils.adjustSaturation(GamificationColors.badge, -20),
      
      // Backgrounds neutres
      background: BackgroundSystems.parent.primary,
      backgroundSecondary: BackgroundSystems.parent.secondary,
      backgroundTertiary: BackgroundSystems.parent.tertiary,
      surface: BackgroundSystems.parent.elevated,
      
      // Hiérarchie de texte claire
      text: TextSystems.parent.primary,
      textSecondary: TextSystems.parent.secondary,
      textTertiary: TextSystems.parent.tertiary,
      textInverse: TextSystems.parent.inverse,
      
      // Textes sur couleurs
      onPrimary: TextSystems.parent.onPrimary,
      onSecondary: TextSystems.parent.onSecondary,
      onAccent: TextSystems.parent.onAccent,
      onSuccess: TextSystems.parent.onSuccess,
      onWarning: TextSystems.parent.onWarning,
      onError: TextSystems.parent.onError,
      
      // Palette de gris étendue pour la hiérarchie
      gray: ParentCoreColors.gray,
      
      // Bordures précises
      border: BorderSystems.parent.light,
      borderMedium: BorderSystems.parent.medium,
      borderStrong: BorderSystems.parent.strong,
      
      // États interactifs subtils
      hover: ColorUtils.adjustBrightness(ParentCoreColors.primary, 5),
      active: ColorUtils.adjustBrightness(ParentCoreColors.primary, -5),
      disabled: ParentCoreColors.gray[400],
      focus: ParentCoreColors.accent,
      
      // Couleurs sémantiques étendues
      semantics: {
        // États de validation
        pending: '#FFA726',
        approved: '#66BB6A',
        rejected: '#EF5350',
        draft: '#BDBDBD',
        
        // Priorités
        highPriority: '#F44336',
        mediumPriority: '#FF9800',
        lowPriority: '#4CAF50',
        
        // Catégories
        chores: '#795548',
        homework: '#3F51B5',
        behavior: '#9C27B0',
        sports: '#4CAF50',
        creative: '#FF5722',
      },
      
      // Mode sombre optionnel
      dark: {
        background: '#121212',
        backgroundSecondary: '#1E1E1E',
        backgroundTertiary: '#2D2D2D',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#B3B3B3',
        textTertiary: '#808080',
        border: '#404040',
      }
    };
  }

  /**
   * Génère la typographie professionnelle
   */
  private static generateTypography(config: typeof ParentConfiguration) {
    const baseSize = 16;
    
    return {
      fontFamilies: {
        // Polices professionnelles et lisibles
        regular: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        medium: 'Inter Medium, system-ui',
        semiBold: 'Inter SemiBold, system-ui',
        bold: 'Inter Bold, system-ui',
        extraBold: 'Inter ExtraBold, system-ui',
        light: 'Inter Light, system-ui',
        
        // Polices spécialisées
        display: 'Inter Display, system-ui',
        mono: 'JetBrains Mono, "Fira Code", "SF Mono", Monaco, monospace',
        
        // Fallbacks pour compatibilité
        system: 'system-ui, -apple-system, sans-serif',
      },
      
      sizes: {
        xs: 12,
        sm: 14,
        md: baseSize,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
        '5xl': 36,
        '6xl': 48,
        '7xl': 56,
        '8xl': 64,
        '9xl': 72,
      },
      
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
      
      weights: {
        light: '300',
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
      },
      
      // Styles pré-définis pour cohérence
      presets: {
        h1: {
          fontSize: 32,
          fontWeight: '700',
          lineHeight: 1.25,
          letterSpacing: '-0.025em',
        },
        h2: {
          fontSize: 28,
          fontWeight: '600',
          lineHeight: 1.25,
          letterSpacing: '-0.025em',
        },
        h3: {
          fontSize: 24,
          fontWeight: '600',
          lineHeight: 1.3,
        },
        h4: {
          fontSize: 20,
          fontWeight: '600',
          lineHeight: 1.4,
        },
        body: {
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 1.5,
        },
        bodySmall: {
          fontSize: 14,
          fontWeight: '400',
          lineHeight: 1.4,
        },
        caption: {
          fontSize: 12,
          fontWeight: '400',
          lineHeight: 1.3,
          color: '#6B7280',
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 1.4,
        },
        button: {
          fontSize: 16,
          fontWeight: '500',
          lineHeight: 1.25,
          letterSpacing: '0.025em',
        },
      }
    };
  }

  /**
   * Génère les espacements professionnels
   */
  private static generateSpacing(config: typeof ParentConfiguration) {
    const base = 4;
    
    return {
      // Espacement de base (4px)
      px: 1,
      0: 0,
      0.5: base * 0.5,
      1: base,
      1.5: base * 1.5,
      2: base * 2,
      2.5: base * 2.5,
      3: base * 3,
      3.5: base * 3.5,
      4: base * 4,
      5: base * 5,
      6: base * 6,
      7: base * 7,
      8: base * 8,
      9: base * 9,
      10: base * 10,
      11: base * 11,
      12: base * 12,
      14: base * 14,
      16: base * 16,
      20: base * 20,
      24: base * 24,
      28: base * 28,
      32: base * 32,
      36: base * 36,
      40: base * 40,
      44: base * 44,
      48: base * 48,
      52: base * 52,
      56: base * 56,
      60: base * 60,
      64: base * 64,
      72: base * 72,
      80: base * 80,
      96: base * 96,
      
      // Touch targets
      touchTarget: {
        minimum: 44,     // Standard minimum
        comfortable: 48, // Confortable
        spacious: 56,    // Généreux
      },
      
      // Rayons de bordure
      borderRadius: config.borderRadius,
      
      // Espacements sémantiques
      semantic: {
        cardPadding: base * 6,       // 24px
        sectionSpacing: base * 8,    // 32px
        containerPadding: base * 6,  // 24px
        tableRowHeight: base * 12,   // 48px
        formSpacing: base * 4,       // 16px
        buttonPadding: {
          sm: { x: base * 3, y: base * 2 },   // 12px x 8px
          md: { x: base * 4, y: base * 2.5 }, // 16px x 10px
          lg: { x: base * 6, y: base * 3 },   // 24px x 12px
        }
      }
    };
  }

  /**
   * Génère les animations discrètes
   */
  private static generateAnimations(config: typeof ParentConfiguration) {
    return {
      durations: {
        instant: 0,
        fast: 150,
        normal: 200,
        slow: 300,
        lazy: 500,
      },
      
      easings: {
        linear: 'linear',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smoothOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
        smoothInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Pas de célébrations
      celebration: false,
      reducedMotion: true, // Respecte les préférences utilisateur
      
      // Animations subtiles pour feedback
      feedback: {
        success: 'fade + gentle-scale',
        error: 'shake + highlight',
        loading: 'pulse',
        hover: 'lift',
        focus: 'glow',
      }
    };
  }

  /**
   * Génère les effets sobres
   */
  private static generateEffects(colors: any) {
    return {
      shadows: ShadowSystems.parent,
      
      // Effets de focus pour accessibilité
      focus: {
        ring: `0 0 0 3px ${colors.accent}40`,
        outline: `2px solid ${colors.accent}`,
      },
      
      // Dégradés subtils
      gradients: {
        subtle: `linear-gradient(135deg, ${colors.background}, ${colors.backgroundSecondary})`,
        header: `linear-gradient(90deg, ${colors.primary}, ${ColorUtils.adjustBrightness(colors.primary, -10)})`,
        card: `linear-gradient(145deg, ${colors.surface}, ${ColorUtils.adjustBrightness(colors.surface, -2)})`,
      },
      
      // Overlays
      overlays: {
        modal: 'rgba(0, 0, 0, 0.6)',
        tooltip: 'rgba(0, 0, 0, 0.9)',
        loading: 'rgba(255, 255, 255, 0.8)',
      },
      
      // États de hover subtils
      hover: {
        card: ColorUtils.adjustBrightness(colors.surface, -2),
        button: ColorUtils.adjustBrightness(colors.primary, 5),
        row: colors.gray[50],
      }
    };
  }

  // Méthodes utilitaires
  private static getFeatures(): string[] {
    return [
      'Interface professionnelle',
      'Contraste WCAG AAA maximal',
      'Navigation clavier complète',
      'Support lecteurs d\'écran',
      'Animations respectueuses',
      'Densité ajustable',
      'Mode sombre disponible',
      'Raccourcis clavier',
      'Optimisé pour la productivité',
      'Tables et listes avancées',
    ];
  }

  private static calculateAverageContrast(colors: any): number {
    const ratios = [
      ColorUtils.getContrastRatio(colors.text, colors.background),
      ColorUtils.getContrastRatio(colors.onPrimary, colors.primary),
      ColorUtils.getContrastRatio(colors.onSecondary, colors.secondary),
      ColorUtils.getContrastRatio(colors.textSecondary, colors.background),
    ];
    
    return Math.round(ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length * 10) / 10;
  }
}