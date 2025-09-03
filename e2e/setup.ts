import { beforeAll, beforeEach, afterAll } from '@jest/globals';
import { device, cleanup } from 'detox';

// Configuration globale pour les tests E2E
beforeAll(async () => {
  
  // Attendre que l'application soit prête
  await device.launchApp({
    permissions: {
      notifications: 'YES',
      camera: 'YES',
      photos: 'YES',
    },
    launchArgs: {
      detoxEnableSynchronization: 0, // Désactiver la synchronisation pour certains tests
    },
  });

});

beforeEach(async () => {
  // Recharger l'app avant chaque test pour un état propre
  await device.reloadReactNative();
  
  // Attendre que l'écran de chargement disparaisse
  try {
    await waitFor(element(by.id('splash-screen')))
      .not.toBeVisible()
      .withTimeout(10000);
  } catch (error) {
    // Le splash screen n'existe peut-être pas, continuer
  }
});

afterAll(async () => {
  await cleanup();
});

// Helpers utilitaires pour les tests
export const TestHelpers = {
  // Attendre qu'un élément soit visible avec timeout
  waitForElement: async (matcher: Detox.NativeMatcher, timeout = 10000) => {
    await waitFor(element(matcher))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Attendre et taper du texte
  typeText: async (testID: string, text: string) => {
    await element(by.id(testID)).tap();
    await element(by.id(testID)).typeText(text);
  },

  // Faire défiler jusqu'à un élément
  scrollToElement: async (scrollViewTestID: string, elementTestID: string) => {
    await waitFor(element(by.id(elementTestID)))
      .toBeVisible()
      .whileElement(by.id(scrollViewTestID))
      .scroll(200, 'down');
  },

  // Attendre que l'application charge
  waitForAppToLoad: async () => {
    try {
      // Attendre que le loader disparaisse
      await waitFor(element(by.id('app-loading')))
        .not.toBeVisible()
        .withTimeout(15000);
    } catch (error) {
    }
  },

  // Nettoyer les données de l'app
  resetApp: async () => {
    await device.resetContentAndSettings();
    await device.launchApp();
    await TestHelpers.waitForAppToLoad();
  },

  // Simuler une perte de connexion
  simulateOffline: async () => {
    await device.setURLBlacklist(['.*']);
  },

  // Restaurer la connexion
  simulateOnline: async () => {
    await device.setURLBlacklist([]);
  },

  // Prendre une capture d'écran
  takeScreenshot: async (name: string) => {
    await device.takeScreenshot(name);
  },
};

// Configuration des timeouts globaux
jest.setTimeout(300000); // 5 minutes pour les tests E2E

// Mock des notifications pour les tests
beforeEach(() => {
  // Désactiver les notifications pendant les tests
  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }));
});

export default TestHelpers;