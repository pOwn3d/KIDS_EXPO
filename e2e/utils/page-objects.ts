// Page Objects pour les tests E2E - Pattern pour encapsuler les interactions avec les pages
import { element, by, waitFor, device } from 'detox';
import { TestData, TestTimings } from './test-data';

export class BasePage {
  async waitForElement(testID: string, timeout = TestTimings.medium) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  async tapElement(testID: string) {
    await element(by.id(testID)).tap();
  }

  async typeText(testID: string, text: string) {
    await element(by.id(testID)).tap();
    await element(by.id(testID)).clearText();
    await element(by.id(testID)).typeText(text);
  }

  async scrollToElement(scrollViewTestID: string, elementTestID: string) {
    await waitFor(element(by.id(elementTestID)))
      .toBeVisible()
      .whileElement(by.id(scrollViewTestID))
      .scroll(200, 'down');
  }

  async expectElementVisible(testID: string) {
    await expect(element(by.id(testID))).toBeVisible();
  }

  async expectElementNotVisible(testID: string) {
    await expect(element(by.id(testID))).not.toBeVisible();
  }

  async expectTextVisible(text: string) {
    await expect(element(by.text(text))).toBeVisible();
  }
}

export class WelcomePage extends BasePage {
  async tapGetStarted() {
    await this.tapElement('welcome-get-started-button');
  }

  async tapLogin() {
    await this.tapElement('welcome-login-button');
  }

  async tapRegister() {
    await this.tapElement('welcome-register-button');
  }

  async expectWelcomeScreenVisible() {
    await this.expectElementVisible('welcome-screen');
  }
}

export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.typeText(TestData.testIDs.auth.emailInput, email);
    await this.typeText(TestData.testIDs.auth.passwordInput, password);
    await this.tapElement(TestData.testIDs.auth.loginButton);
  }

  async loginAsParent() {
    await this.login(TestData.users.parent.email, TestData.users.parent.password);
  }

  async tapForgotPassword() {
    await this.tapElement(TestData.testIDs.auth.forgotPasswordLink);
  }

  async tapSwitchToChild() {
    await this.tapElement('switch-to-child-login');
  }

  async expectLoginScreenVisible() {
    await this.expectElementVisible('login-screen');
  }

  async expectLoginError() {
    await this.expectElementVisible('login-error-message');
  }
}

export class RegisterPage extends BasePage {
  async register(userData: any) {
    await this.typeText('register-first-name-input', userData.firstName);
    await this.typeText('register-last-name-input', userData.lastName);
    await this.typeText('register-email-input', userData.email);
    await this.typeText('register-password-input', userData.password);
    await this.typeText('register-confirm-password-input', userData.password);
    await this.tapElement('register-submit-button');
  }

  async registerWithInvitation(userData: any) {
    await this.register(userData);
    // L'invitation est automatiquement liée via l'URL
  }

  async expectRegistrationSuccess() {
    await this.expectElementVisible('registration-success-modal');
  }
}

export class DashboardPage extends BasePage {
  async expectParentDashboardVisible() {
    await this.expectElementVisible(TestData.testIDs.dashboard.parentDashboard);
  }

  async expectChildDashboardVisible() {
    await this.expectElementVisible(TestData.testIDs.dashboard.childDashboard);
  }

  async tapAddChild() {
    await this.tapElement(TestData.testIDs.dashboard.addChildButton);
  }

  async tapQuickAction(actionIndex: number) {
    await this.tapElement(`quick-action-${actionIndex}`);
  }

  async expectStatsVisible() {
    await this.expectElementVisible('dashboard-stats');
  }

  async expectRecentActivityVisible() {
    await this.expectElementVisible('recent-activity');
  }
}

export class MissionsPage extends BasePage {
  async expectMissionsListVisible() {
    await this.expectElementVisible(TestData.testIDs.missions.missionsList);
  }

  async tapCreateMission() {
    await this.tapElement(TestData.testIDs.missions.createMissionButton);
  }

  async createMission(missionData: any) {
    await this.tapCreateMission();
    await this.typeText('mission-title-input', missionData.title);
    await this.typeText('mission-description-input', missionData.description);
    await this.typeText('mission-points-input', missionData.pointsReward.toString());
    await this.tapElement('mission-submit-button');
  }

  async tapMissionCard(missionIndex: number) {
    await this.tapElement(`mission-card-${missionIndex}`);
  }

  async completeMission(missionIndex: number) {
    await this.tapElement(`complete-mission-${missionIndex}`);
  }

  async expectMissionInList(title: string) {
    await this.expectTextVisible(title);
  }
}

export class RewardsPage extends BasePage {
  async expectRewardsListVisible() {
    await this.expectElementVisible(TestData.testIDs.rewards.rewardsList);
  }

  async tapCreateReward() {
    await this.tapElement(TestData.testIDs.rewards.createRewardButton);
  }

  async createReward(rewardData: any) {
    await this.tapCreateReward();
    await this.typeText('reward-title-input', rewardData.title);
    await this.typeText('reward-description-input', rewardData.description);
    await this.typeText('reward-points-input', rewardData.pointsCost.toString());
    await this.tapElement('reward-submit-button');
  }

  async claimReward(rewardIndex: number) {
    await this.tapElement(`claim-reward-${rewardIndex}`);
  }

  async expectRewardClaimSuccess() {
    await this.expectTextVisible('Récompense réclamée');
  }
}

export class PunishmentsPage extends BasePage {
  async expectPunishmentsListVisible() {
    await this.expectElementVisible(TestData.testIDs.punishments.punishmentsList);
  }

  async tapCreatePunishment() {
    await this.tapElement(TestData.testIDs.punishments.createPunishmentButton);
  }

  async createPunishment(punishmentData: any) {
    await this.tapCreatePunishment();
    await this.typeText('punishment-title-input', punishmentData.title);
    await this.typeText('punishment-description-input', punishmentData.description);
    await this.tapElement('punishment-submit-button');
  }

  async applyPunishment(punishmentIndex: number, childIndex: number) {
    await this.tapElement(`apply-punishment-${punishmentIndex}`);
    await this.tapElement(`select-child-${childIndex}`);
    await this.tapElement('confirm-apply-punishment');
  }

  async expectActivePunishmentVisible(title: string) {
    await this.expectTextVisible(title);
  }
}

export class PinValidationPage extends BasePage {
  async enterPin(pin: string) {
    await this.waitForElement(TestData.testIDs.modals.pinModal);
    await this.typeText(TestData.testIDs.modals.pinInput, pin);
    await this.tapElement(TestData.testIDs.modals.confirmButton);
  }

  async expectPinModalVisible() {
    await this.expectElementVisible(TestData.testIDs.modals.pinModal);
  }

  async expectPinError() {
    await this.expectElementVisible('pin-error-message');
  }
}

export class NavigationHelper extends BasePage {
  async navigateToTab(tabName: string) {
    const tabTestIDs: Record<string, string> = {
      dashboard: TestData.testIDs.navigation.dashboardTab,
      missions: TestData.testIDs.navigation.missionsTab,
      rewards: TestData.testIDs.navigation.rewardsTab,
      profile: TestData.testIDs.navigation.profileTab,
    };

    await this.tapElement(tabTestIDs[tabName]);
  }

  async navigateBack() {
    await this.tapElement('navigation-back-button');
  }

  async openDrawer() {
    await this.tapElement('navigation-drawer-button');
  }

  async expectTabVisible(tabName: string) {
    const tabTestIDs: Record<string, string> = {
      dashboard: TestData.testIDs.navigation.dashboardTab,
      missions: TestData.testIDs.navigation.missionsTab,
      rewards: TestData.testIDs.navigation.rewardsTab,
      profile: TestData.testIDs.navigation.profileTab,
    };

    await this.expectElementVisible(tabTestIDs[tabName]);
  }
}

// Export des instances pour utilisation dans les tests
export const welcomePage = new WelcomePage();
export const loginPage = new LoginPage();
export const registerPage = new RegisterPage();
export const dashboardPage = new DashboardPage();
export const missionsPage = new MissionsPage();
export const rewardsPage = new RewardsPage();
export const punishmentsPage = new PunishmentsPage();
export const pinValidationPage = new PinValidationPage();
export const navigationHelper = new NavigationHelper();