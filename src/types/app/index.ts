// Re-export all app types
export * from './navigation';
export * from './store';

// Platform and Device Types
export interface DeviceInfo {
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelDensity: number;
  orientation: 'portrait' | 'landscape';
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

// Theme Types - Compatible with Box of Crayons system
export interface AppTheme {
  name: string;
  mode?: 'child' | 'parent';
  userAge?: 'young' | 'teen' | 'adult';
  worldTheme?: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius | any;
  shadows: ThemeShadows | any;
  animations: ThemeAnimations;
  touchTargets?: any;
}

export interface ThemeColors {
  // Brand Colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  
  // Background Colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text Colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border Colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gamification Colors
  points: string;
  experience: string;
  level: string;
  achievement: string;
  streak?: string;
  badge?: string;
  
  // Interactive states
  hover?: string;
  active?: string;
  disabled?: string;
  focus?: string;
  
  // Platform Specific
  tabBarBackground?: string;
  tabBarActiveText?: string;
  tabBarInactiveText?: string;
  sidebarBackground?: string;
  sidebarActiveBackground?: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeAnimations {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

// Component Props Types
export interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  style?: any;
  children?: React.ReactNode;
}

export interface ResponsiveComponentProps extends BaseComponentProps {
  mobileStyle?: any;
  tabletStyle?: any;
  desktopStyle?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
  message?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Form Types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'textarea' | 'switch' | 'slider';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  disabled?: boolean;
  hint?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text?: string;
      };
    };
    y?: {
      display: boolean;
      title?: {
        display: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Types
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

export interface AnalyticsEvent extends AppEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
}