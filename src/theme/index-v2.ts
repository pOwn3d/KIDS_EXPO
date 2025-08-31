/**
 * Kids Points App - Theme System V2
 * Architecture modulaire avec validation WCAG AAA automatique
 */

import { ChildThemeGenerator, ChildAgeGroup, UniverseTheme } from './modes/child-theme-generator';
import { ParentThemeGenerator } from './modes/parent-theme-generator';
import { ColorUtils } from './core/color-science';

// Types principaux
export interface KidsPointsTheme {
  mode: 'child' | 'parent';
  ageGroup?: ChildAgeGroup;
  universeTheme?: UniverseTheme;
  
  colors: {
    // Couleurs principales
    primary: string;
    secondary: string;
    accent: string;
    
    // Couleurs de statut
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Gamification
    points: string;
    experience: string;
    level: string;
    achievement: string;
    streak: string;
    badge: string;
    
    // Backgrounds
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    
    // Textes
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Textes sur couleurs
    onPrimary: string;
    onSecondary: string;
    onAccent: string;
    onSuccess: string;
    onWarning: string;
    onError: string;
    
    // Bordures
    border: string;
    borderStrong?: string;
    
    // États interactifs
    hover: string;
    active: string;
    disabled: string;
    focus: string;
    
    // Couleurs étendues (mode enfant)
    red?: string;
    blue?: string;
    green?: string;
    yellow?: string;
    purple?: string;
    orange?: string;
    pink?: string;
    teal?: string;
  };
  
  typography: {
    fontFamilies: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
      extraBold: string;
      light?: string;
      display?: string;
      mono?: string;
      handwriting?: string;
    };
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
      '5xl': number;
      '6xl': number;
      '7xl': number;
      '8xl': number;
      '9xl': number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    weights?: {
      light?: string;
      regular: string;
      medium: string;
      semiBold?: string;
      bold: string;
      extraBold?: string;
    };
  };
  
  spacing: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
    '3xl'?: number;
    '4xl'?: number;
    
    touchTarget: {
      min: number;
      comfortable?: number;
      generous?: number;
    };
    
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl?: number;
      full: number;
    };
  };
  
  animations: {
    durations: {
      instant: number;
      fast: number;
      normal: number;
      slow: number;
      celebration?: number;
    };
    easings: {
      smooth: string;
      bounce?: string;
      elastic?: string;
      spring?: string;
    };
    celebration?: boolean;
    reducedMotion?: boolean;
  };
  
  effects: {
    shadows: any;
    glow?: any;
    gradients?: any;
  };
  
  metadata: {
    name: string;
    displayName: string;
    description: string;
    features: string[];
    accessibility: {
      wcagLevel: 'AA' | 'AAA';
      contrastRatio: number;
      touchTargetSize: number;
      reducedMotion?: boolean;
      screenReader?: boolean;
      keyboardNavigation?: boolean;
    };
  };
}

// Factory principal pour créer des thèmes
export class ThemeFactory {
  /**
   * Crée un thème enfant
   */
  static createChildTheme(
    ageGroup: ChildAgeGroup = 'child',
    universeTheme?: UniverseTheme
  ): KidsPointsTheme {
    return ChildThemeGenerator.generate(ageGroup, universeTheme) as KidsPointsTheme;
  }

  /**
   * Crée un thème parent
   */
  static createParentTheme(): KidsPointsTheme {
    return ParentThemeGenerator.generate() as KidsPointsTheme;
  }

  /**
   * Valide un thème selon les standards WCAG
   */
  static validateTheme(theme: KidsPointsTheme): {
    isValid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test contraste principal
    const primaryContrast = ColorUtils.getContrastRatio(theme.colors.text, theme.colors.background);
    if (primaryContrast < 7) {
      issues.push(`Contraste texte/background insuffisant: ${primaryContrast.toFixed(1)}:1 (requis: 7:1)`);
      score -= 20;
    }

    // Test contraste texte sur couleurs
    const onPrimaryContrast = ColorUtils.getContrastRatio(theme.colors.onPrimary, theme.colors.primary);
    if (onPrimaryContrast < 7) {
      issues.push(`Contraste texte sur couleur primaire insuffisant: ${onPrimaryContrast.toFixed(1)}:1`);
      score -= 15;
    }

    // Test touch targets
    if (theme.spacing.touchTarget.min < 44) {
      issues.push(`Touch target trop petit: ${theme.spacing.touchTarget.min}px (minimum: 44px)`);
      score -= 10;
    }

    // Test lisibilité typographie
    if (theme.typography.sizes.md < 14) {
      issues.push(`Texte de base trop petit: ${theme.typography.sizes.md}px (minimum recommandé: 14px)`);
      score -= 5;
    }

    // Recommandations
    if (theme.mode === 'child' && theme.spacing.touchTarget.min < 60) {
      recommendations.push('Augmenter les touch targets pour les enfants (60px+ recommandé)');
    }

    if (theme.animations.reducedMotion === false && theme.mode === 'parent') {
      recommendations.push('Considérer activer reducedMotion par défaut pour les parents');
    }

    return {
      isValid: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Compare deux thèmes
   */
  static compareThemes(theme1: KidsPointsTheme, theme2: KidsPointsTheme) {
    const validation1 = this.validateTheme(theme1);
    const validation2 = this.validateTheme(theme2);
    
    return {
      theme1: {
        name: theme1.metadata.name,
        score: validation1.score,
        accessibility: theme1.metadata.accessibility,
      },
      theme2: {
        name: theme2.metadata.name,
        score: validation2.score,
        accessibility: theme2.metadata.accessibility,
      },
      recommendation: validation1.score >= validation2.score ? theme1.metadata.name : theme2.metadata.name,
      scoreDifference: Math.abs(validation1.score - validation2.score),
    };
  }
}

// Thèmes pré-construits pour compatibilité
export const PredefinedThemes = {
  // Thèmes enfant par âge
  childYoung: ThemeFactory.createChildTheme('young'),
  childDefault: ThemeFactory.createChildTheme('child'),
  childTeen: ThemeFactory.createChildTheme('teen'),
  
  // Thèmes enfant avec univers
  childAqua: ThemeFactory.createChildTheme('child', 'aqua'),
  childFantasy: ThemeFactory.createChildTheme('child', 'fantasy'),
  childSpace: ThemeFactory.createChildTheme('child', 'space'),
  childJungle: ThemeFactory.createChildTheme('child', 'jungle'),
  childCandy: ThemeFactory.createChildTheme('child', 'candy'),
  childVolcano: ThemeFactory.createChildTheme('child', 'volcano'),
  childIce: ThemeFactory.createChildTheme('child', 'ice'),
  childRainbow: ThemeFactory.createChildTheme('child', 'rainbow'),
  
  // Thème parent
  parent: ThemeFactory.createParentTheme(),
} as const;

// Utilitaires pour sélection automatique
export class ThemeSelector {
  /**
   * Sélectionne automatiquement le meilleur thème selon l'âge
   */
  static selectByAge(age: number, universePreference?: UniverseTheme): KidsPointsTheme {
    let ageGroup: ChildAgeGroup;
    
    if (age <= 6) ageGroup = 'young';
    else if (age <= 10) ageGroup = 'child';
    else ageGroup = 'teen';
    
    return ThemeFactory.createChildTheme(ageGroup, universePreference);
  }

  /**
   * Sélectionne le thème selon le rôle utilisateur
   */
  static selectByRole(role: 'parent' | 'child', childAge?: number, universePreference?: UniverseTheme): KidsPointsTheme {
    if (role === 'parent') {
      return ThemeFactory.createParentTheme();
    }
    
    if (childAge) {
      return this.selectByAge(childAge, universePreference);
    }
    
    return ThemeFactory.createChildTheme('child', universePreference);
  }

  /**
   * Obtient la liste de tous les thèmes disponibles
   */
  static getAllAvailableThemes(): Array<{
    key: string;
    theme: KidsPointsTheme;
    category: 'child-age' | 'child-universe' | 'parent';
  }> {
    const themes = [];
    
    // Thèmes par âge
    themes.push(
      { key: 'young', theme: PredefinedThemes.childYoung, category: 'child-age' as const },
      { key: 'child', theme: PredefinedThemes.childDefault, category: 'child-age' as const },
      { key: 'teen', theme: PredefinedThemes.childTeen, category: 'child-age' as const }
    );
    
    // Thèmes d'univers
    themes.push(
      { key: 'aqua', theme: PredefinedThemes.childAqua, category: 'child-universe' as const },
      { key: 'fantasy', theme: PredefinedThemes.childFantasy, category: 'child-universe' as const },
      { key: 'space', theme: PredefinedThemes.childSpace, category: 'child-universe' as const },
      { key: 'jungle', theme: PredefinedThemes.childJungle, category: 'child-universe' as const },
      { key: 'candy', theme: PredefinedThemes.childCandy, category: 'child-universe' as const },
      { key: 'volcano', theme: PredefinedThemes.childVolcano, category: 'child-universe' as const },
      { key: 'ice', theme: PredefinedThemes.childIce, category: 'child-universe' as const },
      { key: 'rainbow', theme: PredefinedThemes.childRainbow, category: 'child-universe' as const }
    );
    
    // Thème parent
    themes.push(
      { key: 'parent', theme: PredefinedThemes.parent, category: 'parent' as const }
    );
    
    return themes;
  }
}

// Validation de tous les thèmes prédéfinis
const validateAllThemes = () => {
  const themes = ThemeSelector.getAllAvailableThemes();
  const results = themes.map(({ key, theme, category }) => ({
    key,
    category,
    validation: ThemeFactory.validateTheme(theme)
  }));
  
  console.log('🎨 Theme System V2 - Validation Results:');
  results.forEach(({ key, validation }) => {
    const status = validation.isValid ? '✅' : '❌';
    const score = validation.score;
    console.log(`${status} ${key}: ${score}% - ${validation.issues.length} issues`);
    
    if (validation.issues.length > 0) {
      validation.issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
    }
  });
  
  const allValid = results.every(r => r.validation.isValid);
  const averageScore = results.reduce((sum, r) => sum + r.validation.score, 0) / results.length;
  
  console.log(`\n🎯 Overall System Health: ${averageScore.toFixed(1)}% (${allValid ? 'All themes valid' : 'Some issues found'})`);
  
  return { results, allValid, averageScore };
};

// Exécuter la validation
const systemHealth = validateAllThemes();

// Exports principaux
export {
  // Générateurs
  ChildThemeGenerator,
  ParentThemeGenerator,
  
  // Utilitaires
  ColorUtils,
  
  // Types
  type ChildAgeGroup,
  type UniverseTheme,
  
  // Système de santé
  systemHealth
};

// Export par défaut pour compatibilité
export default ThemeFactory;