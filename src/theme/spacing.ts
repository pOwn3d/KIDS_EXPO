// Box of Crayons Spacing System
import { Platform, Dimensions } from 'react-native';

// Get device dimensions
const { width: screenWidth } = Dimensions.get('window');

// Base spacing unit (4px for precise control)
const BASE_UNIT = 4;

// Standard spacing scale
export const Spacing = {
  // Micro spacing
  px: 1,
  '0.5': BASE_UNIT * 0.5,   // 2px
  '1': BASE_UNIT * 1,       // 4px
  '1.5': BASE_UNIT * 1.5,   // 6px
  '2': BASE_UNIT * 2,       // 8px
  '2.5': BASE_UNIT * 2.5,   // 10px
  '3': BASE_UNIT * 3,       // 12px
  '3.5': BASE_UNIT * 3.5,   // 14px
  '4': BASE_UNIT * 4,       // 16px
  '5': BASE_UNIT * 5,       // 20px
  '6': BASE_UNIT * 6,       // 24px
  '7': BASE_UNIT * 7,       // 28px
  '8': BASE_UNIT * 8,       // 32px
  '9': BASE_UNIT * 9,       // 36px
  '10': BASE_UNIT * 10,     // 40px
  '11': BASE_UNIT * 11,     // 44px
  '12': BASE_UNIT * 12,     // 48px
  '14': BASE_UNIT * 14,     // 56px
  '16': BASE_UNIT * 16,     // 64px
  '20': BASE_UNIT * 20,     // 80px
  '24': BASE_UNIT * 24,     // 96px
  '28': BASE_UNIT * 28,     // 112px
  '32': BASE_UNIT * 32,     // 128px
  '36': BASE_UNIT * 36,     // 144px
  '40': BASE_UNIT * 40,     // 160px
  '44': BASE_UNIT * 44,     // 176px
  '48': BASE_UNIT * 48,     // 192px
  '52': BASE_UNIT * 52,     // 208px
  '56': BASE_UNIT * 56,     // 224px
  '60': BASE_UNIT * 60,     // 240px
  '64': BASE_UNIT * 64,     // 256px
  '72': BASE_UNIT * 72,     // 288px
  '80': BASE_UNIT * 80,     // 320px
  '96': BASE_UNIT * 96,     // 384px
} as const;

// Semantic spacing
export const SemanticSpacing = {
  // Content spacing
  contentPadding: {
    mobile: Spacing['4'],     // 16px
    tablet: Spacing['6'],     // 24px  
    desktop: Spacing['8'],    // 32px
  },
  
  // Section spacing
  sectionGap: {
    mobile: Spacing['6'],     // 24px
    tablet: Spacing['8'],     // 32px
    desktop: Spacing['10'],   // 40px
  },
  
  // Card spacing
  cardPadding: {
    mobile: Spacing['4'],     // 16px
    tablet: Spacing['5'],     // 20px
    desktop: Spacing['6'],    // 24px
  },
  
  // Button spacing
  buttonPadding: {
    mobile: {
      horizontal: Spacing['4'], // 16px
      vertical: Spacing['3'],   // 12px
    },
    tablet: {
      horizontal: Spacing['5'], // 20px
      vertical: Spacing['3.5'], // 14px
    },
    desktop: {
      horizontal: Spacing['6'], // 24px
      vertical: Spacing['4'],   // 16px
    },
  },
} as const;

// Touch targets with age-appropriate sizing
export const TouchTargets = {
  // Minimum touch target sizes
  young: {
    // 4-6 years old - larger targets
    minimum: 72,
    recommended: 80,
    button: {
      height: 72,
      padding: Spacing['6'], // 24px
    },
    icon: {
      size: 48,
      touchArea: 72,
    },
  },
  
  teen: {
    // 7-15 years old - standard mobile targets
    minimum: 56,
    recommended: 64,
    button: {
      height: 56,
      padding: Spacing['4'], // 16px
    },
    icon: {
      size: 32,
      touchArea: 56,
    },
  },
  
  adult: {
    // Parents - efficient targets
    minimum: 44,
    recommended: 48,
    button: {
      height: 48,
      padding: Spacing['4'], // 16px
    },
    icon: {
      size: 24,
      touchArea: 48,
    },
  },
} as const;

// Border radius system
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 999,
  
  // Mode-specific radius
  child: {
    // More rounded for playful feel
    button: 24,
    card: 20,
    input: 16,
    modal: 24,
    badge: 999, // Fully rounded
  },
  
  parent: {
    // Subtle rounding for professional feel
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    badge: 8,
  },
} as const;

// Responsive breakpoints
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Responsive spacing utilities
export const getResponsiveSpacing = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  if (screenWidth >= Breakpoints.desktop) {
    return desktop || tablet || mobile;
  }
  if (screenWidth >= Breakpoints.tablet) {
    return tablet || mobile;
  }
  return mobile;
};

// Container max widths
export const ContainerMaxWidths = {
  mobile: '100%',
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Grid system
export const GridSystem = {
  // Number of columns
  columns: 12,
  
  // Gutter spacing
  gutters: {
    mobile: Spacing['4'],   // 16px
    tablet: Spacing['6'],   // 24px
    desktop: Spacing['8'],  // 32px
  },
  
  // Column widths (as percentages)
  columnWidths: {
    1: 8.333333,   // 1/12
    2: 16.666667,  // 2/12
    3: 25,         // 3/12
    4: 33.333333,  // 4/12
    5: 41.666667,  // 5/12
    6: 50,         // 6/12
    7: 58.333333,  // 7/12
    8: 66.666667,  // 8/12
    9: 75,         // 9/12
    10: 83.333333, // 10/12
    11: 91.666667, // 11/12
    12: 100,       // 12/12
  },
} as const;

// Z-index scale
export const ZIndex = {
  hide: -1,
  auto: 'auto' as const,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Safe area spacing
export const SafeAreaSpacing = {
  // iOS safe area insets
  ios: Platform.select({
    ios: {
      top: 44,    // Status bar + navigation
      bottom: 34, // Home indicator
    },
    default: {
      top: 0,
      bottom: 0,
    },
  }),
  
  // Android system bars
  android: Platform.select({
    android: {
      top: 24,    // Status bar
      bottom: 0,  // Navigation handled separately
    },
    default: {
      top: 0,
      bottom: 0,
    },
  }),
} as const;

// Layout spacing helpers
export const LayoutSpacing = {
  // Page margins
  pageMargin: {
    mobile: Spacing['4'],
    tablet: Spacing['6'],
    desktop: Spacing['8'],
  },
  
  // Section padding
  sectionPadding: {
    mobile: Spacing['6'],
    tablet: Spacing['8'],
    desktop: Spacing['12'],
  },
  
  // Component gaps
  componentGap: {
    tight: Spacing['2'],    // 8px
    normal: Spacing['4'],   // 16px
    loose: Spacing['6'],    // 24px
    extra: Spacing['8'],    // 32px
  },
  
  // List spacing
  listSpacing: {
    compact: Spacing['2'],  // 8px
    comfortable: Spacing['4'], // 16px
    spacious: Spacing['6'], // 24px
  },
} as const;