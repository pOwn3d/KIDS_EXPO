// Box of Crayons Color System
export const CrayonColors = {
  // Vibrant Crayon Colors for Children
  red: '#FF6B6B',
  electricBlue: '#4D96FF',
  successGreen: '#6BCB77',
  sunYellow: '#FFD93D',
  magicPurple: '#BB6BD9',
  vitaminOrange: '#FF9F43',
  candyPink: '#FF6B9D',
  turquoise: '#00CEC9',
  
  // Secondary shades
  purpleLight: '#A78BFA',
  orangeLight: '#FB923C',
  pinkLight: '#F9A8D4',
  turquoiseLight: '#5EEAD4',
} as const;

export const ProfessionalColors = {
  // Professional Parent Palette
  navy: '#2C3E50',
  slate: '#34495E',
  professionalBlue: '#3498DB',
  darkBlue: '#2980B9',
  businessGreen: '#27AE60',
  warningOrange: '#F39C12',
  errorRed: '#E74C3C',
} as const;

// Child Mode Backgrounds
export const ChildBackgrounds = {
  pinkLight: '#FFF5F5',
  skyBlue: '#F0F9FF',
  paleYellow: '#FFFBEB',
  lavender: '#F5F3FF',
  mintGreen: '#F0FDF4',
  peachLight: '#FFF7ED',
} as const;

// Parent Mode Backgrounds
export const ParentBackgrounds = {
  veryLightGray: '#F8F9FA',
  white: '#FFFFFF',
  lightGray: '#E9ECEF',
  coolGray: '#ECF0F1',
} as const;

// Immersive World Themes
export const WorldThemes = {
  aqua: {
    primary: '#00CEC9',
    secondary: '#74B9FF',
    accent: '#81ECEC',
    background: '#E0F7FA',
    surface: '#B2EBF2',
  },
  fantasy: {
    primary: '#A29BFE',
    secondary: '#FD79A8',
    accent: '#E17055',
    background: '#F5F3FF',
    surface: '#DDD6FE',
  },
  space: {
    primary: '#5F27CD',
    secondary: '#00D2D3',
    accent: '#48DBFB',
    background: '#1E1B3A',
    surface: '#2D2A4A',
  },
  jungle: {
    primary: '#00B894',
    secondary: '#FDCB6E',
    accent: '#6C5CE7',
    background: '#E8F5E9',
    surface: '#C8E6C9',
  },
  candy: {
    primary: '#FF6B9D',
    secondary: '#FED330',
    accent: '#C92A2A',
    background: '#FFF5F5',
    surface: '#FFE0EC',
  },
  volcano: {
    primary: '#FF5722',
    secondary: '#FFC107',
    accent: '#FF9800',
    background: '#FBE9E7',
    surface: '#FFCCBC',
  },
  ice: {
    primary: '#00BCD4',
    secondary: '#E0F7FA',
    accent: '#4FC3F7',
    background: '#E1F5FE',
    surface: '#B3E5FC',
  },
  rainbow: {
    primary: 'linear-gradient(90deg, #FF6B6B, #4D96FF, #6BCB77, #FFD93D, #BB6BD9)',
    secondary: '#FFD93D',
    accent: '#4D96FF',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: '#FFFFFF',
  },
} as const;

// Shadow Colors
export const ShadowColors = {
  // Colored shadows for children
  redShadow: 'rgba(255, 107, 107, 0.3)',
  blueShadow: 'rgba(77, 150, 255, 0.3)',
  greenShadow: 'rgba(107, 203, 119, 0.3)',
  yellowShadow: 'rgba(255, 217, 61, 0.3)',
  purpleShadow: 'rgba(187, 107, 217, 0.3)',
  
  // Professional shadows for parents
  grayShadow: 'rgba(0, 0, 0, 0.1)',
  darkShadow: 'rgba(0, 0, 0, 0.2)',
} as const;

// Animated Gradients
export const AnimatedGradients = {
  candy: ['#FF6B9D', '#FED330'],
  ocean: ['#4D96FF', '#00CEC9'],
  galaxy: ['#5F27CD', '#00D2D3'],
  sunset: ['#FF6B6B', '#FFD93D'],
  rainbow: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#BB6BD9'],
  professional: ['#2C3E50', '#3498DB'],
} as const;

// Status Colors (shared between modes)
export const StatusColors = {
  success: '#6BCB77',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#4D96FF',
} as const;

// Gamification Colors (shared)
export const GamificationColors = {
  points: '#FFD93D',      // Gold
  experience: '#BB6BD9',   // Purple
  level: '#6BCB77',       // Green
  achievement: '#FF6B9D',  // Pink
  streak: '#FF6B6B',      // Red
  badge: '#4D96FF',       // Blue
} as const;