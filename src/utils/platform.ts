import { Platform, Dimensions } from 'react-native';
import { DeviceInfo, ResponsiveBreakpoints, PlatformInfo } from '../types/app';

// Default responsive breakpoints
export const BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const { width, height } = Dimensions.get('window');
  const pixelRatio = Platform.select({
    ios: require('react-native').PixelRatio.get(),
    android: require('react-native').PixelRatio.get(),
    web: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    default: 1,
  });

  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = isWeb && width >= BREAKPOINTS.desktop;
  const orientation = width > height ? 'landscape' : 'portrait';

  return {
    isWeb,
    isIOS,
    isAndroid,
    isTablet,
    isDesktop,
    screenWidth: width,
    screenHeight: height,
    pixelDensity: pixelRatio,
    orientation,
  };
};

/**
 * Get platform-specific information for navigation
 */
export const getPlatformInfo = (): PlatformInfo => {
  const deviceInfo = getDeviceInfo();
  
  return {
    isWeb: deviceInfo.isWeb,
    isMobile: !deviceInfo.isTablet && !deviceInfo.isDesktop,
    isTablet: deviceInfo.isTablet && !deviceInfo.isDesktop,
    isDesktop: deviceInfo.isDesktop,
    width: deviceInfo.screenWidth,
    height: deviceInfo.screenHeight,
    screenWidth: deviceInfo.screenWidth,
    screenHeight: deviceInfo.screenHeight,
    shouldUseDesktopNavigation: deviceInfo.isDesktop,
  };
};

/**
 * Determine if the current platform should use mobile navigation (tabs)
 */
export const shouldUseMobileNavigation = (): boolean => {
  const { isDesktop } = getPlatformInfo();
  return !isDesktop;
};

/**
 * Determine if the current platform should use desktop navigation (sidebar)
 */
export const shouldUseDesktopNavigation = (): boolean => {
  const { isDesktop } = getPlatformInfo();
  return isDesktop;
};

/**
 * Get the appropriate number of columns for a grid based on screen size
 */
export const getGridColumns = (
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3
): number => {
  const { isMobile, isTablet, isDesktop } = getPlatformInfo();
  
  if (isDesktop) return desktopColumns;
  if (isTablet) return tabletColumns;
  return mobileColumns;
};

/**
 * Get responsive spacing based on platform
 */
export const getResponsiveSpacing = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  const { isMobile, isTablet, isDesktop } = getPlatformInfo();
  
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  return mobile;
};

/**
 * Get platform-specific font size
 */
export const getResponsiveFontSize = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  const { isMobile, isTablet, isDesktop } = getPlatformInfo();
  
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  return mobile;
};

/**
 * Platform-specific value selector
 */
export const platformSelect = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  const { isMobile, isTablet, isDesktop } = getPlatformInfo();
  
  if (isDesktop && values.desktop !== undefined) return values.desktop;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isMobile && values.mobile !== undefined) return values.mobile;
  return values.default;
};

/**
 * Check if the current platform supports hover interactions
 */
export const supportsHover = (): boolean => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Check if the device has hover capability (not touch-only)
    return window.matchMedia('(hover: hover)').matches;
  }
  return false;
};

/**
 * Check if the current platform supports right-click context menus
 */
export const supportsContextMenu = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Check if the current platform supports keyboard navigation
 */
export const supportsKeyboardNavigation = (): boolean => {
  const { isDesktop } = getPlatformInfo();
  return isDesktop || Platform.OS === 'web';
};

/**
 * Get safe area insets for different platforms
 */
export const getSafeAreaInsets = () => {
  // This would typically come from react-native-safe-area-context
  // For now, return default values
  return {
    top: Platform.select({ ios: 44, android: 24, web: 0, default: 0 }),
    bottom: Platform.select({ ios: 34, android: 0, web: 0, default: 0 }),
    left: 0,
    right: 0,
  };
};

/**
 * Check if current orientation is landscape
 */
export const isLandscape = (): boolean => {
  const { orientation } = getDeviceInfo();
  return orientation === 'landscape';
};

/**
 * Check if current orientation is portrait
 */
export const isPortrait = (): boolean => {
  const { orientation } = getDeviceInfo();
  return orientation === 'portrait';
};

/**
 * Get optimal modal/sheet presentation style for platform
 */
export const getModalPresentationStyle = () => {
  const { isDesktop, isTablet } = getPlatformInfo();
  
  if (isDesktop) return 'dialog'; // Center overlay
  if (isTablet) return 'pageSheet'; // iPad style
  return 'fullScreen'; // Mobile full screen
};

/**
 * Determine if component should render in compact mode
 */
export const shouldUseCompactMode = (): boolean => {
  const { isMobile } = getPlatformInfo();
  return isMobile;
};

/**
 * Get responsive container width
 */
export const getResponsiveContainerWidth = (): string | number => {
  const { isDesktop, width } = getPlatformInfo();
  
  if (isDesktop) {
    // Max width with margins on desktop
    return Math.min(width - 64, 1200);
  }
  
  return '100%';
};

/**
 * Check if platform supports native notifications
 */
export const supportsNativeNotifications = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if platform supports biometric authentication
 */
export const supportsBiometrics = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if platform supports haptic feedback
 */
export const supportsHaptics = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};