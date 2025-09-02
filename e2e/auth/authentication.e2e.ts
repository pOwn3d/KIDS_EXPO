import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  registerPage, 
  dashboardPage,
  navigationHelper 
} from '../utils/page-objects';
import { TestData, TestMessages, TestTimings } from '../utils/test-data';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Welcome Screen', () => {
    it('should show welcome screen on first launch', async () => {
      await welcomePage.expectWelcomeScreenVisible();
      await welcomePage.expectTextVisible('Bienvenue dans Kids Points');
    });

    it('should navigate to login from welcome screen', async () => {
      await welcomePage.tapLogin();
      await loginPage.expectLoginScreenVisible();
    });

    it('should navigate to register from welcome screen', async () => {
      await welcomePage.tapRegister();
      await registerPage.expectElementVisible('register-screen');
    });
  });

  describe('Parent Login', () => {
    beforeEach(async () => {
      await welcomePage.tapLogin();
    });

    it('should successfully login with valid credentials', async () => {
      await loginPage.loginAsParent();
      
      // Attendre que le dashboard apparaisse
      await dashboardPage.expectParentDashboardVisible();
      
      // Vérifier que l'utilisateur est connecté
      await dashboardPage.expectStatsVisible();
    });

    it('should show error with invalid credentials', async () => {
      await loginPage.login('invalid@email.com', 'wrongpassword');
      await loginPage.expectLoginError();
      await loginPage.expectTextVisible('Identifiants incorrects');
    });

    it('should show validation error for invalid email format', async () => {
      await loginPage.login(TestData.forms.invalidEmail, TestData.users.parent.password);
      await loginPage.expectTextVisible(TestMessages.validation.invalidEmail);
    });

    it('should show validation error for empty fields', async () => {
      await loginPage.tapElement(TestData.testIDs.auth.loginButton);
      await loginPage.expectTextVisible(TestMessages.validation.required);
    });

    it('should navigate to forgot password', async () => {
      await loginPage.tapForgotPassword();
      await loginPage.expectElementVisible('forgot-password-screen');
    });

    it('should switch between parent and child login modes', async () => {
      await loginPage.tapSwitchToChild();
      await loginPage.expectTextVisible('Child Login');
      await loginPage.expectElementVisible('child-id-input');
      await loginPage.expectElementVisible('child-pin-input');
    });
  });

  describe('Child Login', () => {
    beforeEach(async () => {
      await welcomePage.tapLogin();
      await loginPage.tapSwitchToChild();
    });

    it('should show child login interface', async () => {
      await loginPage.expectElementVisible('child-login-form');
      await loginPage.expectElementVisible('child-id-input');
      await loginPage.expectElementVisible('child-pin-input');
    });

    it('should show development message for child login', async () => {
      await loginPage.typeText('child-id-input', 'child123');
      await loginPage.typeText('child-pin-input', '1234');
      await loginPage.tapElement(TestData.testIDs.auth.loginButton);
      
      await loginPage.expectTextVisible('La connexion enfant sera disponible bientôt');
    });
  });

  describe('Parent Registration', () => {
    beforeEach(async () => {
      await welcomePage.tapRegister();
    });

    it('should successfully register a new parent', async () => {
      const newUser = {
        ...TestData.users.parent,
        email: `test.${Date.now()}@famille.com`, // Email unique
      };

      await registerPage.register(newUser);
      await registerPage.expectRegistrationSuccess();
      await registerPage.expectTextVisible('Compte créé avec succès');
    });

    it('should show validation errors for invalid data', async () => {
      // Essayer de soumettre avec des champs vides
      await registerPage.tapElement('register-submit-button');
      await registerPage.expectTextVisible(TestMessages.validation.required);
    });

    it('should validate email format', async () => {
      await registerPage.typeText('register-email-input', TestData.forms.invalidEmail);
      await registerPage.tapElement('register-submit-button');
      await registerPage.expectTextVisible(TestMessages.validation.invalidEmail);
    });

    it('should validate password length', async () => {
      await registerPage.typeText('register-password-input', TestData.forms.shortPassword);
      await registerPage.tapElement('register-submit-button');
      await registerPage.expectTextVisible(TestMessages.validation.passwordTooShort);
    });

    it('should validate password confirmation match', async () => {
      const userData = TestData.users.parent;
      await registerPage.typeText('register-first-name-input', userData.firstName);
      await registerPage.typeText('register-last-name-input', userData.lastName);
      await registerPage.typeText('register-email-input', userData.email);
      await registerPage.typeText('register-password-input', userData.password);
      await registerPage.typeText('register-confirm-password-input', 'differentpassword');
      
      await registerPage.tapElement('register-submit-button');
      await registerPage.expectTextVisible(TestMessages.validation.passwordsMismatch);
    });

    it('should navigate back to login after successful registration', async () => {
      const newUser = {
        ...TestData.users.parent,
        email: `test.${Date.now()}@famille.com`,
      };

      await registerPage.register(newUser);
      await registerPage.expectRegistrationSuccess();
      
      // Cliquer sur "Continuer" devrait naviguer vers login
      await registerPage.tapElement('continue-to-login-button');
      await loginPage.expectLoginScreenVisible();
    });
  });

  describe('Invitation Flow', () => {
    it('should handle invitation link', async () => {
      // Simuler une ouverture via lien d'invitation
      await device.openURL({
        url: 'kidspoints://invite?token=test-invitation-token'
      });

      await registerPage.expectElementVisible('invitation-screen');
      await registerPage.expectTextVisible('Invitation reçue');
      await registerPage.expectTextVisible('Rejoindre la famille');
    });

    it('should show invalid invitation error', async () => {
      await device.openURL({
        url: 'kidspoints://invite?token=invalid-token'
      });

      await registerPage.expectElementVisible('invitation-error');
      await registerPage.expectTextVisible('Invitation invalide');
    });

    it('should complete invitation registration', async () => {
      // Simuler une invitation valide
      await device.openURL({
        url: 'kidspoints://invite?token=valid-test-token'
      });

      await registerPage.expectElementVisible('invitation-screen');
      await registerPage.tapElement('accept-invitation-button');
      
      // Compléter l'inscription
      await registerPage.registerWithInvitation(TestData.users.invitedParent);
      
      await registerPage.expectRegistrationSuccess();
      await registerPage.expectTextVisible('Vous avez rejoint la famille');
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Se connecter d'abord
      await welcomePage.tapLogin();
      await loginPage.loginAsParent();
      await dashboardPage.expectParentDashboardVisible();
    });

    it('should successfully logout', async () => {
      // Naviguer vers le profil
      await navigationHelper.navigateToTab('profile');
      
      // Ouvrir les paramètres
      await dashboardPage.tapElement('profile-settings-button');
      
      // Se déconnecter
      await dashboardPage.tapElement('logout-button');
      
      // Confirmer la déconnexion
      await dashboardPage.tapElement('confirm-logout-button');
      
      // Vérifier le retour à l'écran de bienvenue
      await welcomePage.expectWelcomeScreenVisible();
    });
  });

  describe('Session Persistence', () => {
    it('should maintain login session after app restart', async () => {
      // Se connecter
      await welcomePage.tapLogin();
      await loginPage.loginAsParent();
      await dashboardPage.expectParentDashboardVisible();
      
      // Redémarrer l'app
      await device.reloadReactNative();
      
      // Vérifier que l'utilisateur est toujours connecté
      await dashboardPage.expectParentDashboardVisible();
    });

    it('should handle expired session gracefully', async () => {
      // Se connecter
      await welcomePage.tapLogin();
      await loginPage.loginAsParent();
      await dashboardPage.expectParentDashboardVisible();
      
      // Simuler une session expirée (nettoyer le stockage)
      await device.clearCache();
      
      // Essayer de naviguer - devrait rediriger vers login
      await navigationHelper.navigateToTab('missions');
      await loginPage.expectLoginScreenVisible();
    });
  });

  describe('Offline Behavior', () => {
    it('should handle offline login attempt', async () => {
      // Simuler perte de connexion
      await device.setURLBlacklist(['.*']);
      
      await welcomePage.tapLogin();
      await loginPage.loginAsParent();
      
      // Devrait montrer une erreur de réseau
      await loginPage.expectTextVisible(TestMessages.errors.networkError);
      
      // Restaurer la connexion
      await device.setURLBlacklist([]);
    });

    it('should retry login when connection is restored', async () => {
      // Commencer offline
      await device.setURLBlacklist(['.*']);
      
      await welcomePage.tapLogin();
      await loginPage.loginAsParent();
      await loginPage.expectTextVisible(TestMessages.errors.networkError);
      
      // Restaurer la connexion
      await device.setURLBlacklist([]);
      
      // Réessayer
      await loginPage.tapElement('retry-login-button');
      await dashboardPage.expectParentDashboardVisible();
    });
  });
});