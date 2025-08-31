import { useWindowDimensions } from 'react-native';
import { usePlatform } from './usePlatform';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const { isWeb } = usePlatform();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;

  const orientation = width > height ? 'landscape' : 'portrait';
  
  // Responsive value helper
  const responsive = <T,>(mobile: T, tablet?: T, desktop?: T): T => {
    if (isDesktop && desktop !== undefined) return desktop;
    if (isTablet && tablet !== undefined) return tablet;
    return mobile;
  };

  // Grid columns based on screen size
  const getColumns = (minItemWidth: number = 300): number => {
    if (isDesktop) {
      return Math.floor(width / minItemWidth);
    }
    if (isTablet) {
      return 2;
    }
    return 1;
  };

  // Spacing based on screen size
  const spacing = {
    xs: responsive(4, 6, 8),
    sm: responsive(8, 10, 12),
    md: responsive(16, 20, 24),
    lg: responsive(24, 28, 32),
    xl: responsive(32, 40, 48),
  };

  // Font sizes based on screen size
  const fontSize = {
    xs: responsive(12, 13, 14),
    sm: responsive(14, 15, 16),
    md: responsive(16, 17, 18),
    lg: responsive(18, 20, 22),
    xl: responsive(24, 28, 32),
    xxl: responsive(32, 36, 40),
  };

  return {
    // Screen dimensions
    width,
    height,
    orientation,
    
    // Breakpoint flags
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isWeb,
    
    // Helper functions
    responsive,
    getColumns,
    
    // Responsive values
    spacing,
    fontSize,
    
    // Breakpoints
    breakpoints: BREAKPOINTS,
  };
};