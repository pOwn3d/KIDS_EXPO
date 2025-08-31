import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectIsAuthenticated } from '../../store/store';
import { useTheme } from '../../hooks/useSimpleTheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProtectedRoute;