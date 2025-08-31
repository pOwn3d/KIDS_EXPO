import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { DeviceInfo, PlatformInfo } from '../types/app';
import {
  getDeviceInfo,
  getPlatformInfo,
  shouldUseMobileNavigation,
  shouldUseDesktopNavigation,
  supportsHover,
  supportsContextMenu,
  supportsKeyboardNavigation,
} from '../utils/platform';

/**
 * Hook for comprehensive device information
 */
export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDeviceInfo(getDeviceInfo());
    });

    return () => subscription?.remove();
  }, []);

  return deviceInfo;
};

/**
 * Hook for platform-specific information
 */
export const usePlatform = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(getPlatformInfo);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setPlatformInfo(getPlatformInfo());
    });

    return () => subscription?.remove();
  }, []);

  return platformInfo;
};

/**
 * Hook for responsive navigation decisions
 */
export const useNavigation = () => {
  const platform = usePlatform();

  return {
    shouldUseMobileNavigation: shouldUseMobileNavigation(),
    shouldUseDesktopNavigation: shouldUseDesktopNavigation(),
    platform,
  };
};

/**
 * Hook for platform capabilities
 */
export const usePlatformCapabilities = () => {
  const platform = usePlatform();

  return {
    supportsHover: supportsHover(),
    supportsContextMenu: supportsContextMenu(),
    supportsKeyboardNavigation: supportsKeyboardNavigation(),
    ...platform,
  };
};

/**
 * Hook for responsive values based on screen size
 */
export const useResponsive = <T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  const { isMobile, isTablet, isDesktop } = usePlatform();

  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  
  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  
  return values.mobile;
};

/**
 * Hook for responsive spacing
 */
export const useResponsiveSpacing = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  return useResponsive({
    mobile,
    tablet,
    desktop,
  });
};

/**
 * Hook for responsive font sizes
 */
export const useResponsiveFontSize = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  return useResponsive({
    mobile,
    tablet,
    desktop,
  });
};

/**
 * Hook for responsive columns in grid layouts
 */
export const useResponsiveColumns = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): number => {
  return useResponsive({
    mobile,
    tablet,
    desktop,
  });
};

/**
 * Hook for responsive container widths
 */
export const useResponsiveWidth = () => {
  const { isDesktop, width } = usePlatform();

  if (isDesktop) {
    // Max width with margins on desktop
    return Math.min(width - 64, 1200);
  }

  return width;
};

/**
 * Hook for orientation changes
 */
export const useOrientation = () => {
  const deviceInfo = useDeviceInfo();

  return {
    orientation: deviceInfo.orientation,
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape',
  };
};

/**
 * Hook for responsive styles
 */
export const useResponsiveStyle = <T extends Record<string, any>>(styles: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  return useResponsive(styles);
};

/**
 * Hook for detecting when screen size category changes
 */
export const useScreenSizeCategory = () => {
  const platform = usePlatform();
  
  const getCategory = () => {
    if (platform.isDesktop) return 'desktop';
    if (platform.isTablet) return 'tablet';
    return 'mobile';
  };

  const [category, setCategory] = useState(getCategory());

  useEffect(() => {
    const newCategory = getCategory();
    if (newCategory !== category) {
      setCategory(newCategory);
    }
  }, [platform.isDesktop, platform.isTablet, platform.isMobile]);

  return category;
};

/**
 * Hook for platform-specific event handlers
 */
export const usePlatformEventHandlers = () => {
  const capabilities = usePlatformCapabilities();

  return {
    // Hover handlers (desktop only)
    onHoverIn: capabilities.supportsHover ? undefined : () => {},
    onHoverOut: capabilities.supportsHover ? undefined : () => {},
    
    // Context menu handlers (web only)
    onContextMenu: capabilities.supportsContextMenu ? undefined : () => {},
    
    // Focus handlers (keyboard navigation)
    onFocus: capabilities.supportsKeyboardNavigation ? undefined : () => {},
    onBlur: capabilities.supportsKeyboardNavigation ? undefined : () => {},
  };
};

/**
 * Hook for adaptive layouts
 */
export const useAdaptiveLayout = () => {
  const platform = usePlatform();
  const capabilities = usePlatformCapabilities();

  const getLayoutConfig = () => {
    if (platform.isDesktop) {
      return {
        navigationStyle: 'sidebar' as const,
        containerStyle: 'padded' as const,
        interactionMode: 'mouse' as const,
        showAdvancedFeatures: true,
        compactMode: false,
      };
    }

    if (platform.isTablet) {
      return {
        navigationStyle: 'tabs' as const,
        containerStyle: 'fullwidth' as const,
        interactionMode: 'touch' as const,
        showAdvancedFeatures: true,
        compactMode: false,
      };
    }

    return {
      navigationStyle: 'tabs' as const,
      containerStyle: 'fullwidth' as const,
      interactionMode: 'touch' as const,
      showAdvancedFeatures: false,
      compactMode: true,
    };
  };

  return getLayoutConfig();
};