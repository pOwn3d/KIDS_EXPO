import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '@hooks/usePlatform';

interface ResponsiveLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  sidebar?: ReactNode;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  maxWidth?: number;
  padding?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  scrollable = true,
  sidebar,
  style,
  containerStyle,
  maxWidth,
  padding = true,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isDesktop, isTablet, isMobile, screenWidth } = usePlatform();

  const getContentMaxWidth = () => {
    if (maxWidth) return maxWidth;
    if (isDesktop) return 1200;
    if (isTablet) return 768;
    return screenWidth;
  };

  const getPadding = () => {
    if (!padding) return 0;
    if (isDesktop) return 24;
    if (isTablet) return 20;
    return 16;
  };

  const content = (
    <View
      style={[
        styles.contentContainer,
        {
          maxWidth: getContentMaxWidth(),
          paddingHorizontal: getPadding(),
          backgroundColor: colors.background,
        },
        containerStyle,
      ]}
    >
      {children}
    </View>
  );

  const mainContent = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  if (isDesktop && sidebar) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'web' ? 0 : insets.top,
            backgroundColor: colors.background,
          },
          style,
        ]}
      >
        <View style={styles.desktopLayout}>
          <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
            {sidebar}
          </View>
          <View style={styles.mainContent}>{mainContent}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === 'web' ? 0 : insets.top,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {mainContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
});