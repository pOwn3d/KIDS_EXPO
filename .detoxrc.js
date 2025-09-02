/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'info' : 'debug',
    overrideConsole: true,
    options: {
      showLoggerName: true,
      showLevel: true,
      showMetadata: true
    }
  },
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
    },
  },
  artifacts: {
    screenshot: {
      takeWhen: {
        testStart: false,
        testDone: true,
        testFailure: true,
      },
      keepOnlyFailedSpecs: false,
    },
    video: {
      takeWhen: {
        testStart: false,
        testDone: true,
        testFailure: true,
      },
      keepOnlyFailedSpecs: false,
    },
    log: {
      takeWhen: {
        testStart: false,
        testDone: true,
        testFailure: true,
      },
      keepOnlyFailedSpecs: false,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/KidsPoints.app',
      build: 'cd ios && xcodebuild -workspace KidsPoints.xcworkspace -scheme KidsPoints -configuration Debug -sdk iphonesimulator -derivedDataPath build -arch x86_64 ONLY_ACTIVE_ARCH=YES',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/KidsPoints.app',
      build: 'cd ios && xcodebuild -workspace KidsPoints.xcworkspace -scheme KidsPoints -configuration Release -sdk iphonesimulator -derivedDataPath build -arch x86_64 ONLY_ACTIVE_ARCH=YES',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 16',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*', // any attached device
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_34_extension_level_7_arm64-v8a',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};