import { AppTheme } from '../types/app';
import { 
  BoxOfCrayonsTheme,
  ChildThemes, 
  ParentTheme, 
  getThemeForUser,
  createChildTheme,
  createParentTheme 
} from '../theme';

// Base theme configuration
const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const baseTypography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium', 
    bold: 'Inter-Bold',
    light: 'Inter-Light',
    semiBold: 'Inter-SemiBold',
    extraBold: 'Inter-ExtraBold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

const baseBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

const baseShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 25px rgba(0, 0, 0, 0.15)',
};

const baseAnimations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Light Theme - Now using Box of Crayons child theme
export const lightTheme: AppTheme = {
  ...ChildThemes.teen,
  // Keep compatibility with existing structure
  spacing: baseSpacing,
  typography: baseTypography,
  borderRadius: baseBorderRadius,
  shadows: baseShadows,
  animations: baseAnimations,
};

// Dark Theme - Now using Box of Crayons space theme
export const darkTheme: AppTheme = {
  ...ChildThemes.teenSpace,
  // Keep compatibility with existing structure
  spacing: baseSpacing,
  typography: baseTypography,
  borderRadius: baseBorderRadius,
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 25px 25px rgba(0, 0, 0, 0.6)',
  },
  animations: baseAnimations,
};

// Theme variants for different user roles - now using Box of Crayons system
export const childThemeOverrides = ChildThemes.teen.colors;
export const parentThemeOverrides = ParentTheme.colors;

// Export default themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Theme utilities - now using Box of Crayons system
export { getThemeForUser } from '../theme';

// Responsive theme adjustments
export const getResponsiveTheme = (
  baseTheme: AppTheme,
  platform: 'mobile' | 'tablet' | 'desktop'
): AppTheme => {
  const platformAdjustments = {
    mobile: {
      spacing: baseTheme.spacing,
      typography: {
        ...baseTheme.typography,
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 28,
        },
      },
    },
    tablet: {
      spacing: {
        ...baseTheme.spacing,
        md: 20,
        lg: 28,
        xl: 36,
        xxl: 52,
      },
      typography: {
        ...baseTheme.typography,
        fontSize: {
          xs: 13,
          sm: 15,
          md: 17,
          lg: 19,
          xl: 22,
          xxl: 26,
          xxxl: 32,
        },
      },
    },
    desktop: {
      spacing: {
        ...baseTheme.spacing,
        md: 24,
        lg: 32,
        xl: 40,
        xxl: 56,
      },
      typography: {
        ...baseTheme.typography,
        fontSize: {
          xs: 14,
          sm: 16,
          md: 18,
          lg: 20,
          xl: 24,
          xxl: 28,
          xxxl: 36,
        },
      },
    },
  };

  const adjustments = platformAdjustments[platform];

  return {
    ...baseTheme,
    spacing: adjustments.spacing,
    typography: adjustments.typography,
  };
};