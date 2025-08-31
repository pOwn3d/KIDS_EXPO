// Box of Crayons Shadow System
import { Platform } from 'react-native';
import { CrayonColors, ShadowColors } from './colors';

export interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number; // Android only
  // Web shadows
  boxShadow?: string;
}

// Base shadow configurations
const createShadow = (
  color: string, 
  offset: { width: number; height: number }, 
  opacity: number, 
  radius: number,
  elevation: number = 0
): ShadowStyle => {
  if (Platform.OS === 'web') {
    const { width, height } = offset;
    return {
      boxShadow: `${width}px ${height}px ${radius}px rgba(${hexToRgb(color)}, ${opacity})`,
    };
  }
  
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation, // Android
  };
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '0, 0, 0';
};

// Professional shadows for parent mode
export const ProfessionalShadows = {
  none: Platform.select({
    web: { boxShadow: 'none' },
    default: {},
  }),

  xs: createShadow('#000000', { width: 0, height: 1 }, 0.05, 2, 1),
  sm: createShadow('#000000', { width: 0, height: 2 }, 0.1, 4, 2),
  md: createShadow('#000000', { width: 0, height: 4 }, 0.15, 8, 4),
  lg: createShadow('#000000', { width: 0, height: 8 }, 0.2, 16, 8),
  xl: createShadow('#000000', { width: 0, height: 12 }, 0.25, 24, 12),
  '2xl': createShadow('#000000', { width: 0, height: 16 }, 0.3, 32, 16),
};

// Playful colored shadows for child mode
export const PlayfulShadows = {
  none: Platform.select({
    web: { boxShadow: 'none' },
    default: {},
  }),

  // Colored shadows based on crayon colors
  red: {
    sm: createShadow(CrayonColors.red, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.red, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.red, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  blue: {
    sm: createShadow(CrayonColors.electricBlue, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.electricBlue, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.electricBlue, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  green: {
    sm: createShadow(CrayonColors.successGreen, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.successGreen, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.successGreen, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  yellow: {
    sm: createShadow(CrayonColors.sunYellow, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.sunYellow, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.sunYellow, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  purple: {
    sm: createShadow(CrayonColors.magicPurple, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.magicPurple, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.magicPurple, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  pink: {
    sm: createShadow(CrayonColors.candyPink, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.candyPink, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.candyPink, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  orange: {
    sm: createShadow(CrayonColors.vitaminOrange, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.vitaminOrange, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.vitaminOrange, { width: 0, height: 12 }, 0.5, 24, 12),
  },

  turquoise: {
    sm: createShadow(CrayonColors.turquoise, { width: 0, height: 4 }, 0.3, 8, 4),
    md: createShadow(CrayonColors.turquoise, { width: 0, height: 8 }, 0.4, 16, 8),
    lg: createShadow(CrayonColors.turquoise, { width: 0, height: 12 }, 0.5, 24, 12),
  },
};

// 3D Button shadows (pressable effect)
export const Button3DShadows = {
  // Raised state
  raised: Platform.select({
    web: {
      boxShadow: `
        0 4px 0 #2C3E50,
        0 8px 16px rgba(0, 0, 0, 0.3)
      `,
      transform: 'translateY(-2px)',
    },
    default: createShadow('#2C3E50', { width: 0, height: 6 }, 0.4, 12, 8),
  }),

  // Pressed state
  pressed: Platform.select({
    web: {
      boxShadow: `
        0 2px 0 #2C3E50,
        0 4px 8px rgba(0, 0, 0, 0.2)
      `,
      transform: 'translateY(0px)',
    },
    default: createShadow('#2C3E50', { width: 0, height: 2 }, 0.2, 6, 4),
  }),

  // Colored 3D buttons for child mode
  raisedColored: (color: string) => Platform.select({
    web: {
      boxShadow: `
        0 4px 0 ${color},
        0 8px 16px rgba(${hexToRgb(color)}, 0.4)
      `,
      transform: 'translateY(-2px)',
    },
    default: createShadow(color, { width: 0, height: 6 }, 0.4, 12, 8),
  }),

  pressedColored: (color: string) => Platform.select({
    web: {
      boxShadow: `
        0 2px 0 ${color},
        0 4px 8px rgba(${hexToRgb(color)}, 0.3)
      `,
      transform: 'translateY(0px)',
    },
    default: createShadow(color, { width: 0, height: 2 }, 0.3, 6, 4),
  }),
};

// Card shadows with depth
export const CardShadows = {
  floating: Platform.select({
    web: {
      boxShadow: `
        0 10px 30px rgba(0, 0, 0, 0.1),
        0 6px 10px rgba(0, 0, 0, 0.15)
      `,
    },
    default: createShadow('#000000', { width: 0, height: 10 }, 0.15, 20, 10),
  }),

  hovering: Platform.select({
    web: {
      boxShadow: `
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 12px 20px rgba(0, 0, 0, 0.2)
      `,
    },
    default: createShadow('#000000', { width: 0, height: 15 }, 0.2, 30, 15),
  }),

  // Colored card shadows for child mode
  coloredCard: (color: string) => Platform.select({
    web: {
      boxShadow: `
        0 8px 24px rgba(${hexToRgb(color)}, 0.2),
        0 4px 12px rgba(${hexToRgb(color)}, 0.3)
      `,
    },
    default: createShadow(color, { width: 0, height: 8 }, 0.25, 16, 8),
  }),
};

// Modal shadows
export const ModalShadows = {
  default: Platform.select({
    web: {
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.25),
        0 15px 30px rgba(0, 0, 0, 0.35)
      `,
    },
    default: createShadow('#000000', { width: 0, height: 20 }, 0.3, 40, 20),
  }),

  backdrop: Platform.select({
    web: {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    default: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  }),
};

// Glow effects for special elements
export const GlowEffects = {
  // Soft glow
  soft: Platform.select({
    web: {
      boxShadow: '0 0 20px rgba(77, 150, 255, 0.3)',
    },
    default: createShadow('#4D96FF', { width: 0, height: 0 }, 0.3, 20, 0),
  }),

  // Strong glow for achievements
  achievement: Platform.select({
    web: {
      boxShadow: '0 0 30px rgba(255, 217, 61, 0.6)',
    },
    default: createShadow('#FFD93D', { width: 0, height: 0 }, 0.6, 30, 0),
  }),

  // Rainbow glow for special rewards
  rainbow: Platform.select({
    web: {
      boxShadow: `
        0 0 20px rgba(255, 107, 107, 0.3),
        0 0 40px rgba(77, 150, 255, 0.3),
        0 0 60px rgba(107, 203, 119, 0.3)
      `,
    },
    default: createShadow('#4D96FF', { width: 0, height: 0 }, 0.4, 40, 0),
  }),
};

// Text shadows
export const TextShadows = {
  // Subtle text shadow
  subtle: Platform.select({
    web: { textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' },
    default: {},
  }),

  // Bold text shadow for titles
  bold: Platform.select({
    web: { textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' },
    default: {},
  }),

  // Colored text shadows for playful text
  colored: (color: string) => Platform.select({
    web: { textShadow: `0 2px 4px rgba(${hexToRgb(color)}, 0.4)` },
    default: {},
  }),

  // Outline text effect
  outline: Platform.select({
    web: {
      textShadow: `
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000
      `,
    },
    default: {},
  }),
};