/**
 * Kids Points App - Theme System V2 (Main Export)
 * Point d'entrée principal pour le nouveau système de thèmes
 * Compatible avec l'ancienne interface pour migration en douceur
 */

// Export du système principal
export * from './index-v2';
export { default as ThemeFactory } from './index-v2';

// Export des générateurs
export { ChildThemeGenerator } from './modes/child-theme-generator';
export { ParentThemeGenerator } from './modes/parent-theme-generator';

// Export des utilitaires scientifiques
export { ColorUtils, PaletteGenerator } from './core/color-science';
export * from './core/colors-v2';

// Export de la migration
export { default as ThemeAdapter, AutoMigration } from './migration';

// Export des hooks
export { 
  useTheme, 
  useColors, 
  useTypography, 
  useSpacing, 
  useAnimations, 
  useEffects,
  useResponsiveStyles,
  useAccessibility,
  ThemeProvider
} from '../hooks/useSimpleTheme';

// Types principaux
export type { 
  KidsPointsTheme, 
  ChildAgeGroup, 
  UniverseTheme 
} from './index-v2';

// Thèmes pré-construits pour utilisation immédiate
import { PredefinedThemes, ThemeSelector } from './index-v2';
import { ThemeAdapter } from './migration';

// Fonction helper pour remplacement direct de l'ancien système
export const getThemeForUser = (
  userType: 'parent' | 'child',
  age?: number,
  worldTheme?: string
) => {
  const theme = ThemeSelector.selectByRole(
    userType,
    age,
    worldTheme as any
  );
  
  return ThemeAdapter.toAppTheme(theme);
};

// Exports de compatibilité avec l'ancien système
export const ChildThemes = {
  young: ThemeAdapter.toAppTheme(PredefinedThemes.childYoung),
  teen: ThemeAdapter.toAppTheme(PredefinedThemes.childTeen),
  teenSpace: ThemeAdapter.toAppTheme(PredefinedThemes.childSpace),
  teenAqua: ThemeAdapter.toAppTheme(PredefinedThemes.childAqua),
  teenFantasy: ThemeAdapter.toAppTheme(PredefinedThemes.childFantasy),
  teenJungle: ThemeAdapter.toAppTheme(PredefinedThemes.childJungle),
  teenCandy: ThemeAdapter.toAppTheme(PredefinedThemes.childCandy),
  teenVolcano: ThemeAdapter.toAppTheme(PredefinedThemes.childVolcano),
  teenIce: ThemeAdapter.toAppTheme(PredefinedThemes.childIce),
  teenRainbow: ThemeAdapter.toAppTheme(PredefinedThemes.childRainbow),
};

export const ParentTheme = ThemeAdapter.toAppTheme(PredefinedThemes.parent);

// Fonctions factory de compatibilité
export const createChildTheme = (
  age: 'young' | 'teen' = 'teen',
  worldTheme?: string
) => {
  const ageGroup = age === 'young' ? 'young' : age === 'teen' ? 'teen' : 'child';
  const theme = ThemeSelector.selectByRole('child', undefined, worldTheme as any);
  return ThemeAdapter.toAppTheme(theme);
};

export const createParentTheme = () => {
  return ThemeAdapter.toAppTheme(PredefinedThemes.parent);
};

// Interfaces de compatibilité
export interface BoxOfCrayonsTheme extends ReturnType<typeof ThemeAdapter.toAppTheme> {}

// WorldThemes de compatibilité
export const WorldThemes = {
  aqua: { primary: '#009688', secondary: '#4DB6AC', accent: '#B2DFDB' },
  fantasy: { primary: '#9C27B0', secondary: '#BA68C8', accent: '#E1BEE7' },
  space: { primary: '#3F51B5', secondary: '#5C6BC0', accent: '#9FA8DA' },
  jungle: { primary: '#4CAF50', secondary: '#81C784', accent: '#C8E6C9' },
  candy: { primary: '#E91E63', secondary: '#F06292', accent: '#F8BBD9' },
  volcano: { primary: '#FF5722', secondary: '#FF8A65', accent: '#FFCCBC' },
  ice: { primary: '#00BCD4', secondary: '#4DD0E1', accent: '#B2EBF2' },
  rainbow: { primary: '#FF9800', secondary: '#FFB74D', accent: '#FFE0B2' },
} as const;

// Configuration de log pour le développement
if (__DEV__) {
  console.log('🎨 Theme System V2 Loaded');
  console.log(`📊 Available themes: ${Object.keys(PredefinedThemes).length}`);
  console.log('✅ Legacy compatibility enabled');
  
  // Validation rapide
  const sampleValidation = Object.entries(PredefinedThemes).map(([key, theme]) => {
    const validation = theme.metadata?.accessibility?.wcagLevel || 'Unknown';
    const contrast = theme.metadata?.accessibility?.contrastRatio || 'Unknown';
    return `${key}: ${validation} (${contrast}:1)`;
  });
  
  console.log('🔍 Accessibility Status:');
  sampleValidation.forEach(status => console.log(`  ${status}`));
}