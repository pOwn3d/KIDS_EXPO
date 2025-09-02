import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  dashboardPage,
  rewardsPage,
  navigationHelper,
  pinValidationPage
} from '../utils/page-objects';
import { TestData, TestTimings } from '../utils/test-data';

describe('Rewards and Claims System', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Se connecter en tant que parent et configurer l'environnement
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
    await setupTestEnvironment();
  });

  describe('Reward Creation', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('rewards');
      await rewardsPage.expectRewardsListVisible();
    });

    it('should create a digital reward successfully', async () => {
      const reward = TestData.rewards.small;
      
      await rewardsPage.createReward(reward);
      
      // Vérifier la création
      await rewardsPage.expectTextVisible('Récompense créée avec succès');
      await rewardsPage.expectTextVisible(reward.title);
    });

    it('should create a physical reward', async () => {
      await rewardsPage.tapCreateReward();
      
      // Remplir les détails
      await rewardsPage.typeText('reward-title-input', TestData.rewards.big.title);
      await rewardsPage.typeText('reward-description-input', TestData.rewards.big.description);
      await rewardsPage.typeText('reward-points-input', TestData.rewards.big.pointsCost.toString());
      
      // Sélectionner la catégorie
      await rewardsPage.tapElement('category-selector');
      await rewardsPage.tapElement('category-outing');
      
      // Définir les restrictions d'âge
      await rewardsPage.tapElement('age-restriction-selector');
      await rewardsPage.tapElement('age-group-9-12');
      
      // Définir la disponibilité
      await rewardsPage.tapElement('availability-selector');
      await rewardsPage.tapElement('availability-limited');
      await rewardsPage.typeText('availability-quantity-input', '3');
      
      // Soumettre
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création
      await rewardsPage.expectTextVisible('Récompense physique créée');
      await rewardsPage.expectElementVisible('limited-availability-badge');
    });

    it('should validate required fields', async () => {
      await rewardsPage.tapCreateReward();
      
      // Essayer de soumettre sans remplir
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier les erreurs
      await rewardsPage.expectTextVisible('Le titre est obligatoire');
      await rewardsPage.expectTextVisible('La description est obligatoire');
      await rewardsPage.expectTextVisible('Le coût en points est obligatoire');
    });

    it('should validate points cost range', async () => {
      await rewardsPage.tapCreateReward();
      
      await rewardsPage.typeText('reward-title-input', 'Test Reward');
      await rewardsPage.typeText('reward-description-input', 'Description');
      await rewardsPage.typeText('reward-points-input', '0'); // Coût invalide
      
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier l'erreur
      await rewardsPage.expectTextVisible('Le coût doit être supérieur à 0');
    });

    it('should create reward with custom image', async () => {
      await rewardsPage.tapCreateReward();
      
      // Remplir les détails de base
      await rewardsPage.typeText('reward-title-input', 'Récompense avec image');
      await rewardsPage.typeText('reward-description-input', 'Description');
      await rewardsPage.typeText('reward-points-input', '50');
      
      // Ajouter une image personnalisée
      await rewardsPage.tapElement('add-custom-image-button');
      await rewardsPage.tapElement('select-from-gallery');
      
      // Simuler la sélection d'image
      await device.selectPhoto();
      
      // Confirmer
      await rewardsPage.tapElement('confirm-image-button');
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création avec image
      await rewardsPage.expectTextVisible('Récompense créée avec image personnalisée');
      await rewardsPage.expectElementVisible('custom-reward-image');
    });

    it('should set expiration date for time-limited rewards', async () => {
      await rewardsPage.tapCreateReward();
      
      // Remplir les détails de base
      await rewardsPage.typeText('reward-title-input', 'Offre limitée');
      await rewardsPage.typeText('reward-description-input', 'Valable jusqu\'à une certaine date');
      await rewardsPage.typeText('reward-points-input', '75');
      
      // Définir une date d'expiration
      await rewardsPage.tapElement('set-expiration-toggle');
      await rewardsPage.tapElement('expiration-date-picker');
      
      // Sélectionner une date future
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      await rewardsPage.tapElement(`date-${futureDate.getDate()}`);
      
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création avec expiration
      await rewardsPage.expectElementVisible('expiration-badge');
      await rewardsPage.expectTextVisible('Expire le');
    });
  });

  describe('Reward Claiming (Child View)', () => {
    beforeEach(async () => {
      // Créer quelques récompenses et donner des points à l'enfant
      await createTestRewards();
      await givePointsToChild(100);
      await switchToChildView();
    });

    it('should display available rewards', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Vérifier l'affichage des récompenses
      await rewardsPage.expectElementVisible('child-rewards-list');
      await rewardsPage.expectTextVisible(TestData.rewards.small.title);
      await rewardsPage.expectElementVisible('reward-points-cost');
    });

    it('should claim a reward successfully', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Réclamer une récompense
      await rewardsPage.claimReward(0);
      
      // Confirmer la demande
      await rewardsPage.tapElement('confirm-claim-button');
      
      // Vérifier la réclamation
      await rewardsPage.expectRewardClaimSuccess();
      await rewardsPage.expectTextVisible('Demande envoyée aux parents');
      await rewardsPage.expectElementVisible('pending-claim-badge');
    });

    it('should prevent claiming rewards with insufficient points', async () => {
      // Créer une récompense coûteuse
      await switchToParentView();
      await navigationHelper.navigateToTab('rewards');
      await createExpensiveReward();
      await switchToChildView();
      
      await navigationHelper.navigateToTab('rewards');
      
      // Essayer de réclamer
      await rewardsPage.tapElement('reward-card-expensive');
      
      // Vérifier le blocage
      await rewardsPage.expectTextVisible('Points insuffisants');
      await rewardsPage.expectElementVisible('insufficient-points-indicator');
      await rewardsPage.expectElementNotVisible('claim-reward-button');
    });

    it('should show reward details before claiming', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Ouvrir les détails
      await rewardsPage.tapElement('reward-card-0');
      
      // Vérifier les détails
      await rewardsPage.expectElementVisible('reward-detail-modal');
      await rewardsPage.expectTextVisible(TestData.rewards.small.description);
      await rewardsPage.expectTextVisible(`Coût: ${TestData.rewards.small.pointsCost} points`);
      await rewardsPage.expectTextVisible('Mes points actuels:');
    });

    it('should filter rewards by category', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Appliquer un filtre
      await rewardsPage.tapElement('category-filter-button');
      await rewardsPage.tapElement('filter-digital');
      
      // Vérifier le filtrage
      await rewardsPage.expectTextVisible('Récompenses numériques');
      await rewardsPage.expectElementVisible('filtered-rewards-list');
    });

    it('should show points balance and recent claims', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Vérifier l'affichage du solde
      await rewardsPage.expectElementVisible('points-balance-display');
      await rewardsPage.expectTextVisible('Mes points: 100');
      
      // Voir l'historique des réclamations
      await rewardsPage.tapElement('my-claims-button');
      await rewardsPage.expectElementVisible('claims-history');
    });

    it('should handle age-restricted rewards', async () => {
      // Créer une récompense pour un groupe d'âge différent
      await switchToParentView();
      await createAgeRestrictedReward();
      await switchToChildView();
      
      await navigationHelper.navigateToTab('rewards');
      
      // Vérifier que la récompense n'est pas visible ou accessible
      await rewardsPage.expectElementNotVisible('age-restricted-reward');
    });
  });

  describe('Claims Validation (Parent View)', () => {
    beforeEach(async () => {
      // Créer des réclamations en attente
      await createPendingClaims();
      await navigationHelper.navigateToTab('validations');
    });

    it('should display pending claims', async () => {
      await rewardsPage.expectElementVisible('pending-claims-list');
      await rewardsPage.expectElementVisible('claim-card-0');
      await rewardsPage.expectTextVisible('En attente de validation');
    });

    it('should approve a claim successfully', async () => {
      // Ouvrir la réclamation
      await rewardsPage.tapElement('claim-card-0');
      
      // Vérifier les détails
      await rewardsPage.expectElementVisible('claim-detail-screen');
      await rewardsPage.expectTextVisible('Demande de récompense');
      await rewardsPage.expectTextVisible('Points à déduire:');
      
      // Approuver
      await rewardsPage.tapElement('approve-claim-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'approbation
      await rewardsPage.expectTextVisible('Récompense approuvée');
      await rewardsPage.expectTextVisible('Points déduits du compte enfant');
    });

    it('should reject a claim with reason', async () => {
      // Ouvrir la réclamation
      await rewardsPage.tapElement('claim-card-0');
      
      // Rejeter
      await rewardsPage.tapElement('reject-claim-button');
      
      // Ajouter une raison
      await rewardsPage.typeText('rejection-reason-input', 'Comportement inapproprié récent');
      await rewardsPage.tapElement('confirm-rejection-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier le rejet
      await rewardsPage.expectTextVisible('Demande rejetée');
      await rewardsPage.expectTextVisible('Points remboursés');
    });

    it('should batch approve multiple claims', async () => {
      // Créer plusieurs réclamations
      await createMultiplePendingClaims();
      
      // Sélectionner plusieurs réclamations
      await rewardsPage.tapElement('select-all-claims-checkbox');
      
      // Approuver en lot
      await rewardsPage.tapElement('batch-approve-button');
      
      // Confirmer avec PIN
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'approbation en lot
      await rewardsPage.expectTextVisible('3 récompenses approuvées');
    });

    it('should view claim history', async () => {
      // Naviguer vers l'historique
      await rewardsPage.tapElement('claims-history-tab');
      
      // Vérifier l'affichage de l'historique
      await rewardsPage.expectElementVisible('claims-history-list');
      await rewardsPage.expectElementVisible('approved-claims-section');
      await rewardsPage.expectElementVisible('rejected-claims-section');
      
      // Filtrer par statut
      await rewardsPage.tapElement('status-filter-approved');
      await rewardsPage.expectElementVisible('approved-claims-only');
    });

    it('should handle expired claims', async () => {
      // Simuler des réclamations expirées
      await device.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours plus tard
      await device.reloadReactNative();
      
      await navigationHelper.navigateToTab('validations');
      
      // Vérifier la gestion des expirations
      await rewardsPage.expectElementVisible('expired-claims-section');
      await rewardsPage.expectTextVisible('Réclamations expirées');
    });
  });

  describe('Rewards Management', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('rewards');
    });

    it('should edit existing reward', async () => {
      // Créer une récompense d'abord
      await rewardsPage.createReward(TestData.rewards.small);
      
      // Modifier la récompense
      await rewardsPage.tapElement('reward-card-0');
      await rewardsPage.tapElement('edit-reward-button');
      
      // Changer le titre et le coût
      await rewardsPage.typeText('reward-title-input', 'Titre modifié');
      await rewardsPage.typeText('reward-points-input', '35');
      
      await rewardsPage.tapElement('save-changes-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier les modifications
      await rewardsPage.expectTextVisible('Récompense modifiée');
      await rewardsPage.expectTextVisible('Titre modifié');
    });

    it('should deactivate reward', async () => {
      await rewardsPage.createReward(TestData.rewards.small);
      
      // Désactiver la récompense
      await rewardsPage.tapElement('reward-card-0');
      await rewardsPage.tapElement('reward-options-button');
      await rewardsPage.tapElement('deactivate-reward-button');
      
      // Confirmer
      await rewardsPage.tapElement('confirm-deactivate-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la désactivation
      await rewardsPage.expectTextVisible('Récompense désactivée');
      await rewardsPage.expectElementVisible('inactive-reward-badge');
    });

    it('should track reward statistics', async () => {
      // Créer des récompenses et simuler leur utilisation
      await createRewardsWithUsageStats();
      
      // Voir les statistiques
      await rewardsPage.tapElement('rewards-analytics-button');
      
      // Vérifier les statistiques
      await rewardsPage.expectElementVisible('rewards-stats-screen');
      await rewardsPage.expectTextVisible('Récompenses les plus populaires');
      await rewardsPage.expectTextVisible('Total points échangés');
      await rewardsPage.expectElementVisible('usage-chart');
    });

    it('should manage reward categories', async () => {
      // Ouvrir la gestion des catégories
      await rewardsPage.tapElement('manage-categories-button');
      
      // Créer une nouvelle catégorie
      await rewardsPage.tapElement('add-category-button');
      await rewardsPage.typeText('category-name-input', 'Activités créatives');
      await rewardsPage.typeText('category-description-input', 'Activités artistiques et créatives');
      await rewardsPage.tapElement('category-color-selector');
      await rewardsPage.tapElement('color-purple');
      
      await rewardsPage.tapElement('save-category-button');
      
      // Vérifier la création
      await rewardsPage.expectTextVisible('Catégorie créée');
      await rewardsPage.expectElementVisible('category-creative-activities');
    });
  });

  describe('Special Rewards Features', () => {
    it('should handle seasonal/special rewards', async () => {
      await navigationHelper.navigateToTab('rewards');
      
      // Créer une récompense saisonnière
      await rewardsPage.tapCreateReward();
      await rewardsPage.typeText('reward-title-input', 'Récompense de Noël');
      await rewardsPage.typeText('reward-description-input', 'Cadeau spécial de Noël');
      await rewardsPage.typeText('reward-points-input', '200');
      
      // Marquer comme saisonnière
      await rewardsPage.tapElement('seasonal-reward-toggle');
      await rewardsPage.tapElement('season-selector');
      await rewardsPage.tapElement('season-winter');
      
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création
      await rewardsPage.expectElementVisible('seasonal-reward-badge');
      await rewardsPage.expectTextVisible('Récompense saisonnière');
    });

    it('should handle collaborative family rewards', async () => {
      // Créer une récompense familiale
      await navigationHelper.navigateToTab('rewards');
      await rewardsPage.tapCreateReward();
      
      await rewardsPage.typeText('reward-title-input', 'Sortie familiale');
      await rewardsPage.typeText('reward-description-input', 'Activité pour toute la famille');
      await rewardsPage.typeText('reward-points-input', '500');
      
      // Marquer comme récompense familiale
      await rewardsPage.tapElement('family-reward-toggle');
      await rewardsPage.tapElement('collaboration-required-toggle');
      
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création
      await rewardsPage.expectElementVisible('family-reward-badge');
      await rewardsPage.expectTextVisible('Récompense collaborative');
    });

    it('should handle milestone rewards', async () => {
      // Créer une récompense de jalon
      await navigationHelper.navigateToTab('rewards');
      await rewardsPage.tapCreateReward();
      
      await rewardsPage.typeText('reward-title-input', 'Champion du mois');
      await rewardsPage.typeText('reward-description-input', 'Récompense pour 30 jours consécutifs');
      await rewardsPage.typeText('reward-points-input', '100');
      
      // Configurer comme jalon
      await rewardsPage.tapElement('milestone-reward-toggle');
      await rewardsPage.tapElement('milestone-type-selector');
      await rewardsPage.tapElement('milestone-streak');
      await rewardsPage.typeText('milestone-value-input', '30');
      
      await rewardsPage.tapElement('reward-submit-button');
      
      // Vérifier la création
      await rewardsPage.expectElementVisible('milestone-reward-badge');
      await rewardsPage.expectTextVisible('Récompense de jalon');
    });
  });

  // Helpers
  async function setupTestEnvironment() {
    await addTestChildIfNeeded();
    await setupPinIfNeeded();
  }

  async function addTestChildIfNeeded() {
    try {
      await dashboardPage.expectElementVisible('no-children-message');
      await dashboardPage.tapAddChild();
      await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
      await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
      await dashboardPage.typeText('child-age-input', TestData.users.child.age.toString());
      await dashboardPage.typeText('child-pin-input', TestData.users.child.pin);
      await dashboardPage.typeText('child-pin-confirm-input', TestData.users.child.pin);
      await dashboardPage.tapElement('add-child-submit-button');
    } catch (error) {
      // Enfant déjà existant
    }
  }

  async function setupPinIfNeeded() {
    // Configurer le PIN parent si nécessaire
    try {
      await dashboardPage.tapElement('test-pin-action');
      const isSetupNeeded = await pinValidationPage.expectElementVisible('pin-setup-screen');
      if (isSetupNeeded) {
        await pinValidationPage.typeText('pin-setup-input', TestData.users.parent.pin || '1234');
        await pinValidationPage.typeText('pin-confirm-input', TestData.users.parent.pin || '1234');
        await pinValidationPage.tapElement('setup-pin-button');
      } else {
        await pinValidationPage.tapElement(TestData.testIDs.modals.cancelButton);
      }
    } catch (error) {
      // PIN déjà configuré
    }
  }

  async function createTestRewards() {
    await navigationHelper.navigateToTab('rewards');
    await rewardsPage.createReward(TestData.rewards.small);
    await rewardsPage.createReward(TestData.rewards.big);
  }

  async function givePointsToChild(points: number) {
    await navigationHelper.navigateToTab('children');
    await dashboardPage.tapElement('child-card-0');
    await dashboardPage.tapElement('manage-points-button');
    await dashboardPage.typeText('points-adjustment-input', points.toString());
    await dashboardPage.typeText('points-reason-input', 'Points de test');
    await dashboardPage.tapElement('add-points-button');
    await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
  }

  async function switchToChildView() {
    // Simuler la connexion enfant
    await dashboardPage.tapElement('switch-to-child-view-button');
    // Ou se déconnecter et se connecter en tant qu'enfant
  }

  async function switchToParentView() {
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
  }

  async function createExpensiveReward() {
    await rewardsPage.tapCreateReward();
    await rewardsPage.typeText('reward-title-input', 'Récompense coûteuse');
    await rewardsPage.typeText('reward-description-input', 'Très chère');
    await rewardsPage.typeText('reward-points-input', '500');
    await rewardsPage.tapElement('reward-submit-button');
  }

  async function createAgeRestrictedReward() {
    await rewardsPage.tapCreateReward();
    await rewardsPage.typeText('reward-title-input', 'Récompense pour ados');
    await rewardsPage.typeText('reward-description-input', 'Réservée aux plus grands');
    await rewardsPage.typeText('reward-points-input', '75');
    await rewardsPage.tapElement('age-restriction-selector');
    await rewardsPage.tapElement('age-group-13-17');
    await rewardsPage.tapElement('reward-submit-button');
  }

  async function createPendingClaims() {
    await createTestRewards();
    await givePointsToChild(100);
    await switchToChildView();
    await navigationHelper.navigateToTab('rewards');
    await rewardsPage.claimReward(0);
    await rewardsPage.tapElement('confirm-claim-button');
    await switchToParentView();
  }

  async function createMultiplePendingClaims() {
    // Créer 3 réclamations en attente
    for (let i = 0; i < 3; i++) {
      await switchToChildView();
      await navigationHelper.navigateToTab('rewards');
      await rewardsPage.claimReward(0);
      await rewardsPage.tapElement('confirm-claim-button');
      await switchToParentView();
    }
  }

  async function createRewardsWithUsageStats() {
    await createTestRewards();
    // Simuler l'utilisation des récompenses
    for (let i = 0; i < 5; i++) {
      await createPendingClaims();
      await navigationHelper.navigateToTab('validations');
      await rewardsPage.tapElement('approve-claim-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
    }
  }
});