import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { useTheme } from '../hooks/useSimpleTheme';

interface StyledThemeProviderProps {
  children: React.ReactNode;
}

export const StyledThemeProvider: React.FC<StyledThemeProviderProps> = ({ children }) => {
  const theme = useTheme();
  
  // Créer un thème compatible avec styled-components
  const styledTheme = {
    colors: theme.colors || {
      primary: '#0EA5E9',
      secondary: '#A855F7',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textLight: '#9CA3AF',
      textInverse: '#FFFFFF',
      disabled: '#D1D5DB',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
    },
    spacing: theme.spacing || {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: theme.borderRadius || {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    fontSize: theme.fontSize || {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  };
  
  return (
    <ThemeProvider theme={styledTheme}>
      {children}
    </ThemeProvider>
  );
};