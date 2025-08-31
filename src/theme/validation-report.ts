/**
 * Theme Validation Report Generator
 * Génère un rapport complet de validation des thèmes
 */

import { 
  ThemeFactory, 
  ThemeSelector, 
  KidsPointsTheme, 
  PredefinedThemes 
} from './index-v2';
import { ColorUtils } from './core/color-science';

interface ValidationReport {
  themeName: string;
  category: string;
  accessibility: {
    wcagLevel: 'AA' | 'AAA';
    overallScore: number;
    contrastRatio: number;
    touchTargetCompliance: boolean;
    issues: string[];
    recommendations: string[];
  };
  colorHarmony: {
    score: number;
    primaryHue: number;
    saturationBalance: number;
    brightnessRange: number;
    notes: string[];
  };
  usability: {
    childFriendly: number; // 0-100
    parentProfessional: number; // 0-100
    crossPlatform: number; // 0-100
    performance: number; // 0-100
  };
}

export class ThemeValidator {
  /**
   * Valide un thème complet
   */
  static validateTheme(theme: KidsPointsTheme): ValidationReport {
    const accessibility = this.validateAccessibility(theme);
    const colorHarmony = this.validateColorHarmony(theme);
    const usability = this.validateUsability(theme);
    
    return {
      themeName: theme.metadata.name,
      category: theme.mode,
      accessibility,
      colorHarmony,
      usability,
    };
  }

  /**
   * Validation de l'accessibilité
   */
  private static validateAccessibility(theme: KidsPointsTheme) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test contraste principal
    const primaryContrast = ColorUtils.getContrastRatio(
      theme.colors.text, 
      theme.colors.background
    );
    
    if (primaryContrast < 7) {
      issues.push(`Contraste texte principal insuffisant: ${primaryContrast.toFixed(1)}:1`);
      score -= 25;
    }

    // Test contraste sur couleurs
    const onPrimaryContrast = ColorUtils.getContrastRatio(
      theme.colors.onPrimary,
      theme.colors.primary
    );
    
    if (onPrimaryContrast < 7) {
      issues.push(`Contraste sur couleur primaire insuffisant: ${onPrimaryContrast.toFixed(1)}:1`);
      score -= 20;
    }

    // Test touch targets
    const minTouchTarget = theme.spacing.touchTarget.min;
    if (minTouchTarget < 44) {
      issues.push(`Touch target trop petit: ${minTouchTarget}px (minimum: 44px)`);
      score -= 15;
    }

    // Test taille de police
    if (theme.typography.sizes.md < 14) {
      issues.push(`Police de base trop petite: ${theme.typography.sizes.md}px`);
      score -= 10;
    }

    // Recommandations spécifiques
    if (theme.mode === 'child') {
      if (minTouchTarget < 60) {
        recommendations.push('Augmenter touch targets à 60px+ pour les enfants');
      }
      if (theme.typography.sizes.md < 16) {
        recommendations.push('Considérer police plus grande pour enfants (16px+)');
      }
    }

    if (theme.animations.reducedMotion === false && theme.mode === 'parent') {
      recommendations.push('Activer reducedMotion par défaut pour mode parent');
    }

    return {
      wcagLevel: score >= 95 ? 'AAA' : 'AA' as const,
      overallScore: Math.max(0, score),
      contrastRatio: Math.round(primaryContrast * 10) / 10,
      touchTargetCompliance: minTouchTarget >= 44,
      issues,
      recommendations,
    };
  }

  /**
   * Validation de l'harmonie des couleurs
   */
  private static validateColorHarmony(theme: KidsPointsTheme) {
    let score = 100;
    const notes: string[] = [];

    // Analyser la couleur primaire
    const primaryRgb = ColorUtils.hexToRgb(theme.colors.primary);
    if (!primaryRgb) {
      return {
        score: 0,
        primaryHue: 0,
        saturationBalance: 0,
        brightnessRange: 0,
        notes: ['Impossible d\'analyser la couleur primaire'],
      };
    }

    const [primaryH, primaryS, primaryL] = ColorUtils.rgbToHsl(...primaryRgb);

    // Évaluer la saturation
    if (theme.mode === 'child') {
      if (primaryS < 60) {
        notes.push('Saturation faible pour mode enfant');
        score -= 10;
      }
      if (primaryS > 95) {
        notes.push('Saturation très élevée, peut fatiguer');
        score -= 5;
      }
    } else {
      if (primaryS > 70) {
        notes.push('Saturation élevée pour mode professionnel');
        score -= 15;
      }
    }

    // Évaluer la luminosité
    if (primaryL < 20) {
      notes.push('Couleur très sombre, contraste difficile');
      score -= 20;
    }
    if (primaryL > 80) {
      notes.push('Couleur très claire, peut manquer de présence');
      score -= 10;
    }

    // Analyser l'harmonie avec les couleurs secondaires
    const secondaryRgb = ColorUtils.hexToRgb(theme.colors.secondary);
    if (secondaryRgb) {
      const [secondaryH] = ColorUtils.rgbToHsl(...secondaryRgb);
      const hueDifference = Math.abs(primaryH - secondaryH);
      
      if (hueDifference < 15) {
        notes.push('Couleurs primaire/secondaire très proches');
        score -= 5;
      }
      if (hueDifference > 180) {
        notes.push('Couleurs complémentaires - contraste fort');
      }
    }

    return {
      score: Math.max(0, score),
      primaryHue: primaryH,
      saturationBalance: primaryS,
      brightnessRange: primaryL,
      notes,
    };
  }

  /**
   * Validation de l'utilisabilité
   */
  private static validateUsability(theme: KidsPointsTheme) {
    let childFriendly = 50;
    let parentProfessional = 50;
    let crossPlatform = 80; // Base élevée car React Native
    let performance = 80;   // Base élevée car optimisé

    // Évaluation mode enfant
    if (theme.mode === 'child') {
      childFriendly += 30;
      
      // Facteurs positifs pour enfants
      if (theme.spacing.touchTarget.min >= 60) childFriendly += 10;
      if (theme.typography.sizes.md >= 16) childFriendly += 10;
      if (theme.animations.celebration) childFriendly += 5;
      if (theme.spacing.borderRadius.md >= 16) childFriendly += 5;
      
      // Facteurs négatifs pour professionnel
      parentProfessional -= 20;
      if (theme.animations.celebration) parentProfessional -= 10;
      
    } else {
      parentProfessional += 30;
      
      // Facteurs positifs pour professionnels
      if (theme.animations.reducedMotion) parentProfessional += 10;
      if (theme.spacing.touchTarget.min === 44) parentProfessional += 5;
      if (theme.typography.fontFamilies.regular.includes('Inter')) parentProfessional += 10;
      
      // Facteurs négatifs pour enfants
      childFriendly -= 30;
    }

    // Évaluation cross-platform
    if (theme.typography.fontFamilies.regular.includes('system-ui')) crossPlatform += 10;
    if (theme.spacing.touchTarget.min >= 44) crossPlatform += 10;

    // Évaluation performance
    if (theme.animations.durations.normal <= 300) performance += 10;
    if (theme.effects.shadows) performance += 5;

    return {
      childFriendly: Math.min(100, Math.max(0, childFriendly)),
      parentProfessional: Math.min(100, Math.max(0, parentProfessional)),
      crossPlatform: Math.min(100, Math.max(0, crossPlatform)),
      performance: Math.min(100, Math.max(0, performance)),
    };
  }

  /**
   * Génère un rapport complet pour tous les thèmes
   */
  static generateCompleteReport(): {
    summary: {
      totalThemes: number;
      wcagAAACompliant: number;
      averageScore: number;
      bestTheme: string;
      worstTheme: string;
    };
    themes: ValidationReport[];
    recommendations: string[];
  } {
    const allThemes = ThemeSelector.getAllAvailableThemes();
    const reports = allThemes.map(({ theme }) => this.validateTheme(theme));
    
    const wcagAAACount = reports.filter(r => r.accessibility.wcagLevel === 'AAA').length;
    const averageScore = reports.reduce((sum, r) => sum + r.accessibility.overallScore, 0) / reports.length;
    
    const sortedByScore = [...reports].sort((a, b) => b.accessibility.overallScore - a.accessibility.overallScore);
    
    // Recommandations globales
    const recommendations = [
      'Maintenir un contraste minimum de 7:1 pour WCAG AAA',
      'Utiliser des touch targets de 44px minimum (60px+ pour enfants)',
      'Tester tous les thèmes avec des lecteurs d\'écran',
      'Valider les couleurs avec des tests de daltonisme',
      'Respecter les préférences système (prefers-reduced-motion)',
    ];

    return {
      summary: {
        totalThemes: reports.length,
        wcagAAACompliant: wcagAAACount,
        averageScore: Math.round(averageScore * 10) / 10,
        bestTheme: sortedByScore[0]?.themeName || 'None',
        worstTheme: sortedByScore[sortedByScore.length - 1]?.themeName || 'None',
      },
      themes: reports,
      recommendations,
    };
  }

  /**
   * Affiche le rapport dans la console
   */
  static logReport() {
    const report = this.generateCompleteReport();
    
    console.log('🎨 THEME VALIDATION REPORT');
    console.log('=' .repeat(50));
    
    console.log('\n📊 SUMMARY:');
    console.log(`  Total themes: ${report.summary.totalThemes}`);
    console.log(`  WCAG AAA compliant: ${report.summary.wcagAAACompliant}/${report.summary.totalThemes}`);
    console.log(`  Average score: ${report.summary.averageScore}%`);
    console.log(`  Best theme: ${report.summary.bestTheme}`);
    console.log(`  Worst theme: ${report.summary.worstTheme}`);
    
    console.log('\n🔍 DETAILED ANALYSIS:');
    report.themes.forEach(theme => {
      const status = theme.accessibility.wcagLevel === 'AAA' ? '✅' : '⚠️';
      console.log(`  ${status} ${theme.themeName}: ${theme.accessibility.overallScore}% (${theme.accessibility.wcagLevel})`);
      
      if (theme.accessibility.issues.length > 0) {
        theme.accessibility.issues.forEach(issue => {
          console.log(`    ❌ ${issue}`);
        });
      }
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
    console.log('\n' + '='.repeat(50));
    
    return report;
  }
}

// Exécuter le rapport si en mode développement
if (__DEV__) {
  // Délai pour éviter les conflits avec d'autres logs
  setTimeout(() => {
    ThemeValidator.logReport();
  }, 1000);
}

export default ThemeValidator;