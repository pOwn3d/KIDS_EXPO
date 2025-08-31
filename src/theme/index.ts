// Box of Crayons Theme System - Main Entry Point
import { Platform } from 'react-native';
import { 
  CrayonColors, 
  ProfessionalColors, 
  ChildBackgrounds, 
  ParentBackgrounds, 
  WorldThemes,
  StatusColors,
  GamificationColors 
} from './colors';
import { ChildTypography, ParentTypography } from './typography';
import { Spacing, TouchTargets, BorderRadius } from './spacing';
import { ProfessionalShadows, PlayfulShadows } from './shadows';
import { SignatureAnimations, AnimationDurations, EasingFunctions } from './animations';

// Enhanced theme interface
export interface BoxOfCrayonsTheme {
  name: string;
  mode: 'child' | 'parent';
  userAge?: 'young' | 'teen' | 'adult';
  worldTheme?: keyof typeof WorldThemes;
  
  colors: {
    // Primary brand colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    accent: string;
    
    // Background hierarchy
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceSecondary: string;
    
    // Text hierarchy
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Borders
    border: string;
    borderLight: string;
    borderDark: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Gamification colors
    points: string;
    experience: string;
    level: string;
    achievement: string;
    streak: string;
    badge: string;
    
    // Interactive states
    hover: string;
    active: string;
    disabled: string;
    focus: string;
  };
  
  typography: {
    fontFamilies: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
      extraBold: string;
      light: string;
      display: string;
      mono: string;
      handwriting: string;
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
  };
  
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: any;
  animations: typeof SignatureAnimations;
  touchTargets: any;
}

// Child theme factory
export const createChildTheme = (
  age: 'young' | 'teen' = 'teen',
  worldTheme?: keyof typeof WorldThemes
): BoxOfCrayonsTheme => {
  const baseColors = worldTheme ? WorldThemes[worldTheme] : {
    primary: CrayonColors.electricBlue,
    secondary: CrayonColors.sunYellow,
    accent: CrayonColors.candyPink,
    background: ChildBackgrounds.skyBlue,
    surface: '#FFFFFF',
  };

  return {
    name: `child-${age}${worldTheme ? `-${worldTheme}` : ''}`,
    mode: 'child',
    userAge: age,
    worldTheme,
    
    colors: {
      // Primary colors - vibrant and playful
      primary: baseColors.primary,
      primaryDark: CrayonColors.electricBlue,
      primaryLight: CrayonColors.turquoiseLight,
      secondary: baseColors.secondary,
      secondaryDark: CrayonColors.vitaminOrange,
      secondaryLight: CrayonColors.orangeLight,
      accent: baseColors.accent,
      
      // Backgrounds - light and inviting
      background: baseColors.background || ChildBackgrounds.skyBlue,
      backgroundSecondary: ChildBackgrounds.pinkLight,
      backgroundTertiary: ChildBackgrounds.paleYellow,
      surface: baseColors.surface || '#FFFFFF',
      surfaceSecondary: ChildBackgrounds.lavender,
      
      // Text - high contrast but warm
      text: '#2D3748',
      textSecondary: '#4A5568',
      textTertiary: '#718096',
      textInverse: '#FFFFFF',
      
      // Borders - soft and rounded
      border: '#E2E8F0',
      borderLight: '#F7FAFC',
      borderDark: '#CBD5E0',
      
      // Status colors - friendly
      success: CrayonColors.successGreen,
      warning: CrayonColors.sunYellow,
      error: CrayonColors.red,
      info: CrayonColors.electricBlue,
      
      // Gamification - exciting colors
      points: GamificationColors.points,
      experience: GamificationColors.experience,
      level: GamificationColors.level,
      achievement: GamificationColors.achievement,
      streak: GamificationColors.streak,
      badge: GamificationColors.badge,
      
      // Interactive states
      hover: CrayonColors.purpleLight,
      active: CrayonColors.magicPurple,
      disabled: '#A0AEC0',
      focus: CrayonColors.electricBlue,
    },
    
    typography: {
      // New Box of Crayons structure
      fontFamilies: ChildTypography.fontFamilies,
      sizes: ChildTypography.sizes[age],
      lineHeights: ChildTypography.lineHeights,
      
      // Legacy compatibility
      fontFamily: {
        regular: ChildTypography.fontFamilies.regular,
        medium: ChildTypography.fontFamilies.medium,
        bold: ChildTypography.fontFamilies.bold,
        light: ChildTypography.fontFamilies.light,
      },
      fontSize: {
        xs: ChildTypography.sizes[age].xs,
        sm: ChildTypography.sizes[age].sm,
        md: ChildTypography.sizes[age].md,
        lg: ChildTypography.sizes[age].lg,
        xl: ChildTypography.sizes[age].xl,
        xxl: ChildTypography.sizes[age]['2xl'],
        xxxl: ChildTypography.sizes[age]['3xl'],
      },
      lineHeight: ChildTypography.lineHeights,
    },
    
    spacing: Spacing,
    borderRadius: BorderRadius.child,
    shadows: PlayfulShadows,
    animations: SignatureAnimations,
    touchTargets: TouchTargets[age === 'young' ? 'young' : age === 'teen' ? 'teen' : 'teen'],
  };
};

// Parent theme factory
export const createParentTheme = (): BoxOfCrayonsTheme => {
  return {
    name: 'parent-professional',
    mode: 'parent',
    userAge: 'adult',
    
    colors: {
      // Primary colors - professional and trustworthy
      primary: ProfessionalColors.professionalBlue,
      primaryDark: ProfessionalColors.darkBlue,
      primaryLight: '#60A5FA',
      secondary: ProfessionalColors.businessGreen,
      secondaryDark: '#16A085',
      secondaryLight: '#48C9B0',
      accent: ProfessionalColors.warningOrange,
      
      // Backgrounds - clean and minimal
      background: ParentBackgrounds.white,
      backgroundSecondary: ParentBackgrounds.veryLightGray,
      backgroundTertiary: ParentBackgrounds.lightGray,
      surface: ParentBackgrounds.white,
      surfaceSecondary: ParentBackgrounds.veryLightGray,
      
      // Text - professional hierarchy
      text: ProfessionalColors.navy,
      textSecondary: ProfessionalColors.slate,
      textTertiary: '#6B7280',
      textInverse: '#FFFFFF',
      
      // Borders - subtle definition
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      borderDark: '#D1D5DB',
      
      // Status colors - professional
      success: ProfessionalColors.businessGreen,
      warning: ProfessionalColors.warningOrange,
      error: ProfessionalColors.errorRed,
      info: ProfessionalColors.professionalBlue,
      
      // Gamification - shared with children but more subtle
      points: GamificationColors.points,
      experience: GamificationColors.experience,
      level: GamificationColors.level,
      achievement: GamificationColors.achievement,
      streak: GamificationColors.streak,
      badge: GamificationColors.badge,
      
      // Interactive states
      hover: '#EEF2FF',
      active: ProfessionalColors.darkBlue,
      disabled: '#9CA3AF',
      focus: ProfessionalColors.professionalBlue,
    },
    
    typography: {
      // New Box of Crayons structure
      fontFamilies: ParentTypography.fontFamilies,
      sizes: ParentTypography.sizes,
      lineHeights: ParentTypography.lineHeights,
      
      // Legacy compatibility
      fontFamily: {
        regular: ParentTypography.fontFamilies.regular,
        medium: ParentTypography.fontFamilies.medium,
        bold: ParentTypography.fontFamilies.bold,
        light: ParentTypography.fontFamilies.light,
      },
      fontSize: {
        xs: ParentTypography.sizes.xs,
        sm: ParentTypography.sizes.sm,
        md: ParentTypography.sizes.md,
        lg: ParentTypography.sizes.lg,
        xl: ParentTypography.sizes.xl,
        xxl: ParentTypography.sizes['2xl'],
        xxxl: ParentTypography.sizes['3xl'],
      },
      lineHeight: ParentTypography.lineHeights,
    },
    
    spacing: Spacing,
    borderRadius: BorderRadius.parent,
    shadows: ProfessionalShadows,
    animations: SignatureAnimations,
    touchTargets: TouchTargets.adult,
  };
};

// Pre-built theme instances
export const ChildThemes = {
  // Default child themes by age
  young: createChildTheme('young'),
  teen: createChildTheme('teen'),
  
  // World-themed variations for young children
  youngAqua: createChildTheme('young', 'aqua'),
  youngFantasy: createChildTheme('young', 'fantasy'),
  youngSpace: createChildTheme('young', 'space'),
  youngJungle: createChildTheme('young', 'jungle'),
  youngCandy: createChildTheme('young', 'candy'),
  youngVolcano: createChildTheme('young', 'volcano'),
  youngIce: createChildTheme('young', 'ice'),
  youngRainbow: createChildTheme('young', 'rainbow'),
  
  // World-themed variations for teens
  teenAqua: createChildTheme('teen', 'aqua'),
  teenFantasy: createChildTheme('teen', 'fantasy'),
  teenSpace: createChildTheme('teen', 'space'),
  teenJungle: createChildTheme('teen', 'jungle'),
} as const;

export const ParentTheme = createParentTheme();

// Theme utilities
export const getThemeForUser = (
  userType: 'parent' | 'child',
  age?: 'young' | 'teen',
  worldTheme?: keyof typeof WorldThemes
): BoxOfCrayonsTheme => {
  if (userType === 'parent') {
    return ParentTheme;
  }
  
  return createChildTheme(age || 'teen', worldTheme);
};

// Theme context helpers
export const isChildTheme = (theme: BoxOfCrayonsTheme): boolean => {
  return theme.mode === 'child';
};

export const isParentTheme = (theme: BoxOfCrayonsTheme): boolean => {
  return theme.mode === 'parent';
};

// Animation helpers
export const getAnimationDuration = (
  animation: keyof typeof AnimationDurations,
  respectsReducedMotion = true
): number => {
  // Check for reduced motion preference on web
  if (Platform.OS === 'web' && respectsReducedMotion) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return 0; // Disable animations
    }
  }
  
  return AnimationDurations[animation];
};

// Export everything
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './animations';

// Legacy compatibility - map to new theme structure
export const themes = {
  light: createChildTheme('teen'),
  dark: createChildTheme('teen', 'space'),
} as const;

// Default exports
export const lightTheme = ChildThemes.teen;
export const darkTheme = ChildThemes.teenSpace;
export const childThemeOverrides = {}; // Now handled by theme factories
export const parentThemeOverrides = {}; // Now handled by theme factories

// Maintain backward compatibility with existing theme interface
export type AppTheme = BoxOfCrayonsTheme & {
  // Legacy compatibility
  typography: {
    fontFamily?: {
      regular?: string;
      medium?: string;
      bold?: string;
      light?: string;
    };
    fontFamilies: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
      extraBold: string;
      light: string;
      display: string;
      mono: string;
      handwriting: string;
    };
    fontSize?: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
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
    lineHeight?: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
};