/**
 * 🎨 Kids Points System - Design System V2
 * Palette de couleurs moderne et vibrante
 */
export const colors = {
  // Couleurs principales vibrantes
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Main
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  // Couleurs secondaires
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },
  // Couleurs d'accent
  accent: {
    coral: '#FF6B6B',
    mint: '#4ECDC4',
    sunshine: '#FFD93D',
    lavender: '#C589E8',
    peach: '#FFB4A2',
    sky: '#87CEEB',
    lime: '#A8E6CF',
    pink: '#FFB6C1',
  },
  // Couleurs pour enfants (fun et vives)
  kids: {
    red: '#FF4757',
    orange: '#FF6348',
    yellow: '#FFC048',
    green: '#26DE81',
    blue: '#54A0FF',
    purple: '#A55EEA',
    pink: '#FD79A8',
    teal: '#00CEC9',
    // Gradients populaires
    gradients: {
      fire: 'linear-gradient(135deg, #FF4757 0%, #FF6348 100%)',
      ocean: 'linear-gradient(135deg, #54A0FF 0%, #00CEC9 100%)',
      sunset: 'linear-gradient(135deg, #FF6348 0%, #FFC048 100%)',
      candy: 'linear-gradient(135deg, #FD79A8 0%, #A55EEA 100%)',
      forest: 'linear-gradient(135deg, #26DE81 0%, #00CEC9 100%)',
      rainbow: 'linear-gradient(135deg, #FF4757, #FFC048, #26DE81, #54A0FF, #A55EEA)',
      bubblegum: 'linear-gradient(135deg, #FD79A8 0%, #FFB6C1 100%)',
      galaxy: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    },
  },
  // Couleurs pour parents (professionnelles)
  parents: {
    navy: '#2E3A59',
    slate: '#475569',
    steel: '#64748B',
    indigo: '#4F46E5',
    emerald: '#10B981',
    amber: '#F59E0B',
    gradients: {
      professional: 'linear-gradient(135deg, #2E3A59 0%, #4F46E5 100%)',
      subtle: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      elegant: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    },
  },
  // États et feedback
  states: {
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#991B1B',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1E40AF',
    },
  },
  // Gris et neutres
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Backgrounds
  backgrounds: {
    light: '#FFFFFF',
    lightGray: '#F9FAFB',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    // Backgrounds fun pour enfants
    kids: {
      pastel: '#FFF5F7',
      sky: '#E0F2FE',
      mint: '#D1FAE5',
      lemon: '#FEF3C7',
      lavender: '#EDE9FE',
      peach: '#FED7D7',
    },
  },
  // Shadows avec couleurs
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    // Ombres colorées
    colored: {
      blue: '0 10px 25px -5px rgba(14, 165, 233, 0.3)',
      purple: '0 10px 25px -5px rgba(168, 85, 247, 0.3)',
      pink: '0 10px 25px -5px rgba(253, 121, 168, 0.3)',
      green: '0 10px 25px -5px rgba(38, 222, 129, 0.3)',
    },
  },
};

// Thèmes prédéfinis
export const themes = {
  ocean: {
    primary: colors.kids.blue,
    secondary: colors.kids.teal,
    accent: colors.accent.sky,
    background: colors.backgrounds.kids.sky,
    gradient: colors.kids.gradients.ocean,
  },
  candy: {
    primary: colors.kids.pink,
    secondary: colors.kids.purple,
    accent: colors.accent.peach,
    background: colors.backgrounds.kids.pastel,
    gradient: colors.kids.gradients.candy,
  },
  forest: {
    primary: colors.kids.green,
    secondary: colors.kids.teal,
    accent: colors.accent.lime,
    background: colors.backgrounds.kids.mint,
    gradient: colors.kids.gradients.forest,
  },
  sunset: {
    primary: colors.kids.orange,
    secondary: colors.kids.yellow,
    accent: colors.accent.coral,
    background: colors.backgrounds.kids.peach,
    gradient: colors.kids.gradients.sunset,
  },
  galaxy: {
    primary: colors.secondary[500],
    secondary: colors.primary[500],
    accent: colors.accent.lavender,
    background: colors.backgrounds.kids.lavender,
    gradient: colors.kids.gradients.galaxy,
  },
  rainbow: {
    primary: colors.kids.red,
    secondary: colors.kids.blue,
    accent: colors.kids.yellow,
    background: colors.backgrounds.lightGray,
    gradient: colors.kids.gradients.rainbow,
  },
};

// Export types
export type ColorTheme = keyof typeof themes;
export type KidsColor = keyof typeof colors.kids;
export type AccentColor = keyof typeof colors.accent;