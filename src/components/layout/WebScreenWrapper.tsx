import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import WebHeader from './WebHeader';
import { usePlatform } from '../../hooks/usePlatform';

const { width: screenWidth } = Dimensions.get('window');

interface WebScreenWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: any;
  showHeader?: boolean;
  headerProps?: {
    notificationCount?: number;
    showProfile?: boolean;
    showNotifications?: boolean;
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    gradientColors?: string[];
  };
  backgroundColor?: string;
}

const WebScreenWrapper: React.FC<WebScreenWrapperProps> = ({
  children,
  title,
  subtitle,
  icon = 'grid',
  showHeader = true,
  headerProps = {},
  backgroundColor = '#F8FAFC',
}) => {
  const platform = usePlatform();
  const isDesktop = platform.isDesktop;

  // Si ce n'est pas desktop, retourner les enfants tels quels
  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Pas de header sur desktop - on utilise seulement la sidebar */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 24, // Ajouter du padding en haut pour éviter que le contenu colle
  },
});

export default WebScreenWrapper;