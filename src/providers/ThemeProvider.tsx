import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme as useSimpleThemeHook } from '../hooks/useSimpleTheme';

// Créer le contexte du thème
const ThemeContext = createContext<ReturnType<typeof useSimpleThemeHook> | null>(null);

// Provider du thème
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useSimpleThemeHook();
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le thème avec vérification
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Retourner un thème par défaut si le contexte n'est pas disponible
    console.warn('useThemeContext called outside of ThemeProvider, returning default theme');
    return useSimpleThemeHook();
  }
  
  return context;
};