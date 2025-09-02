import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  dashboardPage,
  pinValidationPage,
  rewardsPage
} from '../utils/page-objects';
import { TestData, TestTimings } from '../utils/test-data';

describe('PIN Validation System', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Se connecter en tant que parent
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
  });

  describe('PIN Setup', () => {
    it('should prompt for PIN setup on first sensitive action', async () => {
      // Naviguer vers les récompenses et essayer d'approuver une demande
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.expectRewardsListVisible();
      
      // Essayer d'effectuer une action sensible
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Devrait afficher l'écran de configuration PIN
      await pinValidationPage.expectElementVisible('pin-setup-screen');
      await pinValidationPage.expectTextVisible('Configurer votre PIN de sécurité');
    });

    it('should successfully set up PIN', async () => {
      // Déclencher la configuration PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Configurer le PIN
      await pinValidationPage.typeText('pin-setup-input', TestData.users.parent.pin || '1234');
      await pinValidationPage.typeText('pin-confirm-input', TestData.users.parent.pin || '1234');
      await pinValidationPage.tapElement('setup-pin-button');
      
      // Devrait confirmer la configuration
      await pinValidationPage.expectTextVisible('PIN configuré avec succès');
    });

    it('should validate PIN confirmation match', async () => {
      // Déclencher la configuration PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Entrer des PINs qui ne correspondent pas
      await pinValidationPage.typeText('pin-setup-input', '1234');
      await pinValidationPage.typeText('pin-confirm-input', '5678');
      await pinValidationPage.tapElement('setup-pin-button');
      
      // Devrait afficher une erreur
      await pinValidationPage.expectTextVisible('Les codes PIN ne correspondent pas');
    });

    it('should enforce PIN length requirements', async () => {
      // Déclencher la configuration PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Entrer un PIN trop court
      await pinValidationPage.typeText('pin-setup-input', '12');
      await pinValidationPage.tapElement('setup-pin-button');
      
      // Devrait afficher une erreur
      await pinValidationPage.expectTextVisible('Le PIN doit contenir au moins 4 chiffres');
    });
  });

  describe('PIN Validation', () => {
    beforeEach(async () => {
      // S'assurer que le PIN est configuré
      await setupPinIfNeeded();
    });

    it('should successfully validate correct PIN', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Modal PIN devrait apparaître
      await pinValidationPage.expectPinModalVisible();
      
      // Entrer le bon PIN
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Action devrait se poursuivre
      await rewardsPage.expectTextVisible('Récompense approuvée');
    });

    it('should reject incorrect PIN', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Entrer un mauvais PIN
      await pinValidationPage.enterPin('0000');
      
      // Devrait afficher une erreur
      await pinValidationPage.expectPinError();
      await pinValidationPage.expectTextVisible('Code PIN incorrect');
      
      // Modal devrait rester ouverte
      await pinValidationPage.expectPinModalVisible();
    });

    it('should allow PIN retry after failure', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Entrer un mauvais PIN
      await pinValidationPage.enterPin('0000');
      await pinValidationPage.expectPinError();
      
      // Effacer et entrer le bon PIN
      await pinValidationPage.tapElement('pin-clear-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Action devrait se poursuivre
      await rewardsPage.expectTextVisible('Récompense approuvée');
    });

    it('should lock after multiple failed attempts', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Faire 3 tentatives échouées
      for (let i = 0; i < 3; i++) {
        await pinValidationPage.enterPin('0000');
        await pinValidationPage.expectPinError();
        
        if (i < 2) {
          await pinValidationPage.tapElement('pin-clear-button');
        }
      }
      
      // Devrait verrouiller temporairement
      await pinValidationPage.expectTextVisible('Trop de tentatives échouées');
      await pinValidationPage.expectElementVisible('pin-locked-message');
    });

    it('should cancel PIN validation', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Annuler
      await pinValidationPage.tapElement(TestData.testIDs.modals.cancelButton);
      
      // Modal devrait se fermer sans effectuer l'action
      await pinValidationPage.expectElementNotVisible(TestData.testIDs.modals.pinModal);
      await rewardsPage.expectRewardsListVisible();
    });
  });

  describe('PIN Change', () => {
    beforeEach(async () => {
      await setupPinIfNeeded();
    });

    it('should change PIN successfully', async () => {
      // Naviguer vers les paramètres
      await dashboardPage.navigateToTab('profile');
      await dashboardPage.tapElement('security-settings');
      await dashboardPage.tapElement('change-pin-button');
      
      // Entrer l'ancien PIN
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Entrer le nouveau PIN
      await pinValidationPage.typeText('new-pin-input', '5678');
      await pinValidationPage.typeText('confirm-new-pin-input', '5678');
      await pinValidationPage.tapElement('update-pin-button');
      
      // Devrait confirmer le changement
      await pinValidationPage.expectTextVisible('PIN mis à jour avec succès');
    });

    it('should validate current PIN before change', async () => {
      // Naviguer vers les paramètres
      await dashboardPage.navigateToTab('profile');
      await dashboardPage.tapElement('security-settings');
      await dashboardPage.tapElement('change-pin-button');
      
      // Entrer un mauvais PIN actuel
      await pinValidationPage.enterPin('0000');
      
      // Devrait refuser
      await pinValidationPage.expectTextVisible('PIN actuel incorrect');
    });
  });

  describe('PIN Security Features', () => {
    beforeEach(async () => {
      await setupPinIfNeeded();
    });

    it('should timeout PIN session', async () => {
      // Effectuer une action avec PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Attendre le timeout (simulé)
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, TestTimings.long));
      await device.launchApp();
      
      // La prochaine action sensible devrait demander le PIN à nouveau
      await rewardsPage.tapElement('approve-reward-claim-1');
      await pinValidationPage.expectPinModalVisible();
    });

    it('should mask PIN input', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Taper le PIN
      await pinValidationPage.typeText(TestData.testIDs.modals.pinInput, '1234');
      
      // Le champ devrait afficher des points ou astérisques
      await expect(element(by.id(TestData.testIDs.modals.pinInput)))
        .toHaveText('****');
    });

    it('should clear PIN input on backgrounding', async () => {
      // Déclencher une action nécessitant PIN
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Taper partiellement le PIN
      await pinValidationPage.typeText(TestData.testIDs.modals.pinInput, '12');
      
      // Mettre l'app en arrière-plan
      await device.sendToHome();
      await device.launchApp();
      
      // Le champ PIN devrait être vide
      await expect(element(by.id(TestData.testIDs.modals.pinInput)))
        .toHaveText('');
    });
  });

  describe('Biometric Integration (if available)', () => {
    it('should offer biometric option after PIN setup', async () => {
      // Configurer le PIN
      await setupPinIfNeeded();
      
      // Devrait proposer la biométrie si disponible
      await pinValidationPage.expectElementVisible('enable-biometrics-prompt');
    });

    it('should use biometrics when enabled', async () => {
      // Simuler activation de la biométrie
      await enableBiometricsIfAvailable();
      
      // Déclencher une action sensible
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Devrait proposer la biométrie
      await pinValidationPage.expectElementVisible('biometric-prompt');
    });
  });

  // Helpers
  async function setupPinIfNeeded() {
    try {
      // Essayer de déclencher une action PIN pour voir si déjà configuré
      await dashboardPage.navigateToTab('rewards');
      await rewardsPage.tapElement('approve-reward-claim-0');
      
      // Si modal de configuration apparaît, configurer le PIN
      const isSetupScreen = await pinValidationPage.expectElementVisible('pin-setup-screen');
      if (isSetupScreen) {
        await pinValidationPage.typeText('pin-setup-input', TestData.users.parent.pin || '1234');
        await pinValidationPage.typeText('pin-confirm-input', TestData.users.parent.pin || '1234');
        await pinValidationPage.tapElement('setup-pin-button');
      } else {
        // PIN déjà configuré, annuler l'action
        await pinValidationPage.tapElement(TestData.testIDs.modals.cancelButton);
      }
    } catch (error) {
      // PIN probablement déjà configuré
    }
  }

  async function enableBiometricsIfAvailable() {
    try {
      await pinValidationPage.tapElement('enable-biometrics-button');
      await device.enableBiometric();
    } catch (error) {
      // Biométrie non disponible
    }
  }
});