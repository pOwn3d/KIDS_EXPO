// Type definitions for styled-components theme
import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      background: string;
      surface: string;
      card: string;
      text: string;
      textSecondary: string;
      textLight: string;
      textInverse: string;
      disabled: string;
      border: string;
      borderLight: string;
      tabBarBackground?: string;
      tabBarActive?: string;
      tabBarInactive?: string;
      tabBarActiveText?: string;
      tabBarInactiveText?: string;
      sidebarBackground?: string;
      sidebarText?: string;
      sidebarTextActive?: string;
      sidebarActiveBackground?: string;
      backgroundSecondary?: string;
      backgroundTertiary?: string;
      backgroundLight?: string;
      primaryLight?: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
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
  }
}