// Box of Crayons Typography System
import { Platform } from 'react-native';

export interface TypographyScale {
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
}

export interface FontFamilies {
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
  extraBold: string;
  light: string;
  display: string;
  mono: string;
  handwriting: string;
}

// Child Mode Typography (Playful & Friendly)
// Using system fonts with fallbacks for cross-platform compatibility
export const ChildTypography = {
  fontFamilies: {
    regular: Platform.select({
      ios: 'Avenir-Medium',
      android: 'sans-serif-medium',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'Avenir-Heavy',
      android: 'sans-serif-black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'Avenir-Black',
      android: 'sans-serif-black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'Avenir-Black',
      android: 'sans-serif-black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    extraBold: Platform.select({
      ios: 'Avenir-Black',
      android: 'sans-serif-black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'Avenir-Light',
      android: 'sans-serif-light',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    display: Platform.select({
      ios: 'Avenir-Black',
      android: 'sans-serif-black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo-Regular',
      android: 'monospace',
      web: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      default: 'monospace',
    }),
    handwriting: Platform.select({
      ios: 'Marker Felt',
      android: 'cursive',
      web: 'cursive',
      default: 'System',
    }),
  } as FontFamilies,
  
  // Age-specific font sizes
  sizes: {
    // 4-6 years old (larger text)
    young: {
      xs: 16,
      sm: 18,
      md: 20,
      lg: 22,
      xl: 26,
      '2xl': 30,
      '3xl': 36,
      '4xl': 42,
      '5xl': 48,
      '6xl': 56,
      '7xl': 64,
      '8xl': 72,
      '9xl': 80,
    } as TypographyScale,
    
    // 7-10 years old (medium text)
    medium: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 24,
      '2xl': 28,
      '3xl': 32,
      '4xl': 38,
      '5xl': 44,
      '6xl': 52,
      '7xl': 60,
      '8xl': 68,
      '9xl': 76,
    } as TypographyScale,
    
    // 11-15 years old (standard text)
    teen: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      '2xl': 26,
      '3xl': 30,
      '4xl': 36,
      '5xl': 42,
      '6xl': 48,
      '7xl': 56,
      '8xl': 64,
      '9xl': 72,
    } as TypographyScale,
  },
  
  lineHeights: {
    tight: 1.4,
    normal: 1.6,
    relaxed: 1.8,
  },
};

// Parent Mode Typography (Professional & Clean)
export const ParentTypography = {
  fontFamilies: {
    regular: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'SF Pro Display Medium',
      android: 'Roboto-Medium',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'SF Pro Display Semibold',
      android: 'Roboto-Bold',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'SF Pro Display Bold',
      android: 'Roboto-Bold',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    extraBold: Platform.select({
      ios: 'SF Pro Display Heavy',
      android: 'Roboto-Black',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'SF Pro Display Light',
      android: 'Roboto-Light',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    display: Platform.select({
      ios: 'SF Pro Display Bold',
      android: 'Roboto-Bold',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      web: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      default: 'monospace',
    }),
    handwriting: Platform.select({
      ios: 'Bradley Hand',
      android: 'cursive',
      web: 'cursive',
      default: 'System',
    }),
  } as FontFamilies,
  
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 42,
    '7xl': 48,
    '8xl': 56,
    '9xl': 64,
  } as TypographyScale,
  
  lineHeights: {
    tight: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },
};

// Font weights mapping
export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

// Letter spacing values
export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Text decoration presets
export const TextDecorations = {
  none: 'none',
  underline: 'underline',
  lineThrough: 'line-through',
} as const;

// Text transform presets
export const TextTransforms = {
  none: 'none',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
} as const;

// Typography utilities
export const getChildFontSize = (
  size: keyof TypographyScale, 
  age: 'young' | 'medium' | 'teen'
): number => {
  return ChildTypography.sizes[age][size];
};

export const getParentFontSize = (size: keyof TypographyScale): number => {
  return ParentTypography.sizes[size];
};

// Reading accessibility helpers
export const ReadabilitySettings = {
  dyslexiaFriendly: {
    fontFamily: 'OpenDyslexic-Regular',
    letterSpacing: 0.5,
    lineHeight: 1.8,
  },
  
  highContrast: {
    // Will be applied at theme level
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  
  largeText: {
    multiplier: 1.25, // 125% of base size
  },
};