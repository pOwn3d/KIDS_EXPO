import { Dimensions, Platform, PixelRatio } from 'react-native';
import {
  getDeviceInfo,
  getPlatformInfo,
  shouldUseMobileNavigation,
  shouldUseDesktopNavigation,
  getGridColumns,
  getResponsiveSpacing,
  getResponsiveFontSize,
  platformSelect,
  supportsHover,
  supportsContextMenu,
  supportsKeyboardNavigation,
  isLandscape,
  isPortrait,
  getModalPresentationStyle,
  shouldUseCompactMode,
  supportsNativeNotifications,
  supportsBiometrics,
  supportsHaptics,
  BREAKPOINTS,
} from '../platform';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(),
  },
  PixelRatio: {
    get: jest.fn(),
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;
const mockPlatform = Platform as jest.Mocked<typeof Platform>;
const mockPixelRatio = PixelRatio as jest.Mocked<typeof PixelRatio>;

describe('Platform Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockPixelRatio.get.mockReturnValue(2);
    mockPlatform.OS = 'ios';
    mockPlatform.select.mockImplementation((config: any) => config.ios);
  });

  describe('getDeviceInfo', () => {
    it('should return correct device info for iOS mobile', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toEqual({
        isWeb: false,
        isIOS: true,
        isAndroid: false,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 812,
        pixelDensity: 2,
        orientation: 'portrait',
      });
    });

    it('should return correct device info for web desktop', () => {
      mockDimensions.get.mockReturnValue({ width: 1200, height: 800 });
      mockPlatform.OS = 'web';
      
      // Mock window object for web in jsdom environment
      Object.defineProperty(global.window, 'devicePixelRatio', {
        value: 1,
        configurable: true,
      });

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toEqual({
        isWeb: true,
        isIOS: false,
        isAndroid: false,
        isTablet: true,
        isDesktop: true,
        screenWidth: 1200,
        screenHeight: 800,
        pixelDensity: 1,
        orientation: 'landscape',
      });
    });

    it('should detect tablet correctly', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      mockPlatform.OS = 'ios';

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.isTablet).toBe(true);
      expect(deviceInfo.isDesktop).toBe(false);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return correct platform info for mobile', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      const platformInfo = getPlatformInfo();

      expect(platformInfo.isMobile).toBe(true);
      expect(platformInfo.isTablet).toBe(false);
      expect(platformInfo.isDesktop).toBe(false);
      expect(platformInfo.shouldUseDesktopNavigation).toBe(false);
    });

    it('should return correct platform info for desktop', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      const platformInfo = getPlatformInfo();

      expect(platformInfo.isMobile).toBe(false);
      expect(platformInfo.isTablet).toBe(false);
      expect(platformInfo.isDesktop).toBe(true);
      expect(platformInfo.shouldUseDesktopNavigation).toBe(true);
    });
  });

  describe('Navigation utilities', () => {
    it('should use mobile navigation for mobile devices', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      expect(shouldUseMobileNavigation()).toBe(true);
      expect(shouldUseDesktopNavigation()).toBe(false);
    });

    it('should use desktop navigation for desktop devices', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(shouldUseMobileNavigation()).toBe(false);
      expect(shouldUseDesktopNavigation()).toBe(true);
    });
  });

  describe('getGridColumns', () => {
    it('should return mobile columns for mobile devices', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      expect(getGridColumns(1, 2, 3)).toBe(1);
    });

    it('should return tablet columns for tablet devices', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      mockPlatform.OS = 'ios';

      expect(getGridColumns(1, 2, 3)).toBe(2);
    });

    it('should return desktop columns for desktop devices', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(getGridColumns(1, 2, 3)).toBe(3);
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return mobile spacing for mobile devices', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      expect(getResponsiveSpacing(8, 16, 24)).toBe(8);
    });

    it('should return desktop spacing for desktop devices', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(getResponsiveSpacing(8, 16, 24)).toBe(24);
    });
  });

  describe('platformSelect', () => {
    it('should select mobile value for mobile devices', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      const result = platformSelect({
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
        default: 'default-value',
      });

      expect(result).toBe('mobile-value');
    });

    it('should select desktop value for desktop devices', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      const result = platformSelect({
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
        default: 'default-value',
      });

      expect(result).toBe('desktop-value');
    });

    it('should fall back to default when specific value is not provided', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      const result = platformSelect({
        tablet: 'tablet-value',
        desktop: 'desktop-value',
        default: 'default-value',
      });

      expect(result).toBe('default-value');
    });
  });

  describe('Platform capability checks', () => {
    it('should detect hover support correctly', () => {
      mockPlatform.OS = 'web';
      
      // Mock matchMedia for web in jsdom environment
      Object.defineProperty(global.window, 'matchMedia', {
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(hover: hover)',
        })),
        configurable: true,
      });

      expect(supportsHover()).toBe(true);
    });

    it('should not support hover on mobile', () => {
      mockPlatform.OS = 'ios';

      expect(supportsHover()).toBe(false);
    });

    it('should support context menu on web', () => {
      mockPlatform.OS = 'web';
      expect(supportsContextMenu()).toBe(true);
    });

    it('should not support context menu on mobile', () => {
      mockPlatform.OS = 'ios';
      expect(supportsContextMenu()).toBe(false);
    });

    it('should support keyboard navigation on desktop', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(supportsKeyboardNavigation()).toBe(true);
    });

    it('should support native notifications on native platforms', () => {
      mockPlatform.OS = 'ios';
      expect(supportsNativeNotifications()).toBe(true);

      mockPlatform.OS = 'android';
      expect(supportsNativeNotifications()).toBe(true);

      mockPlatform.OS = 'web';
      expect(supportsNativeNotifications()).toBe(false);
    });

    it('should support biometrics on native platforms', () => {
      mockPlatform.OS = 'ios';
      expect(supportsBiometrics()).toBe(true);

      mockPlatform.OS = 'android';
      expect(supportsBiometrics()).toBe(true);

      mockPlatform.OS = 'web';
      expect(supportsBiometrics()).toBe(false);
    });

    it('should support haptics on native platforms', () => {
      mockPlatform.OS = 'ios';
      expect(supportsHaptics()).toBe(true);

      mockPlatform.OS = 'android';
      expect(supportsHaptics()).toBe(true);

      mockPlatform.OS = 'web';
      expect(supportsHaptics()).toBe(false);
    });
  });

  describe('Orientation checks', () => {
    it('should detect landscape orientation', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
      
      expect(isLandscape()).toBe(true);
      expect(isPortrait()).toBe(false);
    });

    it('should detect portrait orientation', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      
      expect(isLandscape()).toBe(false);
      expect(isPortrait()).toBe(true);
    });
  });

  describe('Modal presentation style', () => {
    it('should return fullScreen for mobile', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      expect(getModalPresentationStyle()).toBe('fullScreen');
    });

    it('should return pageSheet for tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      mockPlatform.OS = 'ios';

      expect(getModalPresentationStyle()).toBe('pageSheet');
    });

    it('should return dialog for desktop', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(getModalPresentationStyle()).toBe('dialog');
    });
  });

  describe('Compact mode', () => {
    it('should use compact mode for mobile', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      mockPlatform.OS = 'ios';

      expect(shouldUseCompactMode()).toBe(true);
    });

    it('should not use compact mode for desktop', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      mockPlatform.OS = 'web';

      expect(shouldUseCompactMode()).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should have correct breakpoints', () => {
      expect(BREAKPOINTS).toEqual({
        mobile: 0,
        tablet: 768,
        desktop: 1024,
        largeDesktop: 1440,
      });
    });
  });
});