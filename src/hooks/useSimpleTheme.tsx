/**
 * Simple theme hook - no complex CSS, just basic colors
 */

export const useTheme = () => {
  // Simple color palette adapted from React project
  const colors = {
    // Main colors from design-system/colors-v2
    primary: '#0EA5E9',      // primary.500
    secondary: '#A855F7',    // secondary.500
    success: '#10B981',      // states.success.main
    warning: '#F59E0B',      // states.warning.main
    error: '#EF4444',        // states.error.main
    info: '#3B82F6',         // states.info.main
    
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',      // gray.50
    card: '#FFFFFF',
    
    // Text colors
    text: '#1F2937',         // gray.800
    textSecondary: '#6B7280', // gray.500
    textLight: '#9CA3AF',    // gray.400
    textInverse: '#FFFFFF',
    disabled: '#D1D5DB',     // gray.300
    
    // Borders
    border: '#E5E7EB',       // gray.200
    borderLight: '#F3F4F6',  // gray.100
    
    // Navigation specific - matching React project navbar
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#A855F7', // Purple from React navbar
    tabBarInactive: '#9CA3AF',
    
    // Sidebar colors for desktop - from React project
    sidebarBackground: '#FFFFFF',
    sidebarText: '#374151',  // gray.700
    sidebarTextSecondary: '#6B7280', // gray.500
    sidebarActive: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)', // purple to blue gradient
    sidebarHover: '#F9FAFB', // gray.50
    
    // Kids theme colors
    kids: {
      red: '#FF4757',
      orange: '#FF6348',
      yellow: '#FFC048',
      green: '#26DE81',
      blue: '#54A0FF',
      purple: '#A55EEA',
      pink: '#FD79A8',
      teal: '#00CEC9',
    },
    
    // Parent theme colors
    parents: {
      navy: '#2E3A59',
      slate: '#475569',
      steel: '#64748B',
      indigo: '#4F46E5',
      emerald: '#10B981',
      amber: '#F59E0B',
    },
  };

  // Simple spacing values
  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  // Simple border radius
  const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  };

  // Simple font sizes
  const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };

  return {
    colors,
    spacing,
    borderRadius,
    fontSize,
    // Simplified typography
    typography: {
      fontFamilies: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
      },
      sizes: fontSize,
    },
    // Touch target for accessibility
    touchTarget: {
      min: 44,
    },
  };
};

// Export a simple provider that just passes through
import React from 'react';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};