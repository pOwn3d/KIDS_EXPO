import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  dashboardPage,
  punishmentsPage,
  navigationHelper,
  pinValidationPage
} from '../utils/page-objects';
import { TestData, TestTimings } from '../utils/test-data';

describe('Punishments System', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Se connecter en tant que parent et configurer l'environnement
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
    await setupTestEnvironment();
  });

  describe('Punishment Creation', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('punishments');
      await punishmentsPage.expectPunishmentsListVisible();
    });

    it('should create a digital punishment successfully', async () => {
      const punishment = TestData.punishments.light;
      
      await punishmentsPage.createPunishment(punishment);
      
      // Vérifier la création
      await punishmentsPage.expectTextVisible('Punition créée avec succès');
      await punishmentsPage.expectTextVisible(punishment.title);
    });

    it('should create a punishment with all options', async () => {
      await punishmentsPage.tapCreatePunishment();
      
      // Remplir tous les détails
      await punishmentsPage.typeText('punishment-title-input', TestData.punishments.strict.title);
      await punishmentsPage.typeText('punishment-description-input', TestData.punishments.strict.description);
      
      // Sélectionner la catégorie
      await punishmentsPage.tapElement('category-selector');
      await punishmentsPage.tapElement('category-general');
      
      // Sélectionner la difficulté
      await punishmentsPage.tapElement('difficulty-selector');
      await punishmentsPage.tapElement('difficulty-medium');
      
      // Définir le groupe d'âge
      await punishmentsPage.tapElement('age-group-selector');
      await punishmentsPage.tapElement('age-group-6-8');
      
      // Définir la durée par défaut
      await punishmentsPage.typeText('default-duration-input', '24');
      
      // Options avancées
      await punishmentsPage.tapElement('escalation-options-toggle');
      await punishmentsPage.tapElement('allow-early-release-toggle');
      
      // Soumettre
      await punishmentsPage.tapElement('punishment-submit-button');
      
      // Vérifier la création
      await punishmentsPage.expectTextVisible('Punition complète créée');
      await punishmentsPage.expectElementVisible('punishment-options-badge');
    });

    it('should validate required fields', async () => {
      await punishmentsPage.tapCreatePunishment();
      
      // Essayer de soumettre sans remplir
      await punishmentsPage.tapElement('punishment-submit-button');
      
      // Vérifier les erreurs
      await punishmentsPage.expectTextVisible('Le titre est obligatoire');
      await punishmentsPage.expectTextVisible('La description est obligatoire');
    });

    it('should validate duration range', async () => {
      await punishmentsPage.tapCreatePunishment();
      
      await punishmentsPage.typeText('punishment-title-input', 'Test Punishment');
      await punishmentsPage.typeText('punishment-description-input', 'Description');
      await punishmentsPage.typeText('default-duration-input', '0'); // Durée invalide
      
      await punishmentsPage.tapElement('punishment-submit-button');
      
      // Vérifier l'erreur
      await punishmentsPage.expectTextVisible('La durée doit être supérieure à 0');
    });

    it('should create age-appropriate punishment', async () => {
      await punishmentsPage.tapCreatePunishment();
      
      // Remplir les détails
      await punishmentsPage.typeText('punishment-title-input', 'Punition pour petit');
      await punishmentsPage.typeText('punishment-description-input', 'Adaptée aux jeunes enfants');
      
      // Sélectionner groupe d'âge jeune
      await punishmentsPage.tapElement('age-group-selector');
      await punishmentsPage.tapElement('age-group-3-5');
      
      // Sélectionner difficulté facile
      await punishmentsPage.tapElement('difficulty-selector');
      await punishmentsPage.tapElement('difficulty-easy');
      
      await punishmentsPage.tapElement('punishment-submit-button');
      
      // Vérifier la création
      await punishmentsPage.expectTextVisible('Punition créée pour 3-5 ans');
      await punishmentsPage.expectElementVisible('age-appropriate-badge');
    });

    it('should create punishment template', async () => {
      await punishmentsPage.createPunishment(TestData.punishments.light);
      
      // Sauvegarder comme template
      await punishmentsPage.tapElement('punishment-card-0');
      await punishmentsPage.tapElement('save-as-template-button');
      
      await punishmentsPage.typeText('template-name-input', 'Template Pas de Tablette');
      await punishmentsPage.typeText('template-description-input', 'Template pour restrictions numériques');
      
      await punishmentsPage.tapElement('save-template-button');
      
      // Vérifier la sauvegarde
      await punishmentsPage.expectTextVisible('Template de punition sauvegardé');
    });
  });

  describe('Punishment Application', () => {
    beforeEach(async () => {
      // Créer des punitions et enfants de test
      await createTestPunishments();
      await navigationHelper.navigateToTab('punishments');
    });

    it('should apply punishment to child successfully', async () => {
      // Ouvrir l'application de punition
      await punishmentsPage.applyPunishment(0, 0);
      
      // Personnaliser la durée
      await punishmentsPage.typeText('punishment-duration-input', '12');
      await punishmentsPage.typeText('punishment-reason-input', 'Comportement inapproprié');
      
      // Confirmer avec PIN
      await punishmentsPage.tapElement('confirm-apply-punishment');
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'application
      await punishmentsPage.expectTextVisible('Punition appliquée');
      await punishmentsPage.expectTextVisible('L\'enfant a été notifié');
    });

    it('should apply immediate punishment for urgent cases', async () => {
      await punishmentsPage.tapElement('punishment-card-0');
      
      // Mode urgence
      await punishmentsPage.tapElement('urgent-apply-toggle');
      await punishmentsPage.tapElement('apply-to-child-button');
      
      // Sélectionner l'enfant
      await punishmentsPage.tapElement('child-selector');
      await punishmentsPage.tapElement('child-option-0');
      
      // Raison obligatoire en mode urgence
      await punishmentsPage.typeText('urgent-reason-input', 'Comportement dangereux');
      
      // Appliquer immédiatement
      await punishmentsPage.tapElement('immediate-apply-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'application immédiate
      await punishmentsPage.expectTextVisible('Punition appliquée immédiatement');
      await punishmentsPage.expectElementVisible('active-punishment-notification');
    });

    it('should apply graduated punishment', async () => {
      // Créer une punition avec escalade
      await createGraduatedPunishment();
      
      // Première application (niveau 1)
      await punishmentsPage.applyPunishment(0, 0);
      await punishmentsPage.tapElement('confirm-apply-punishment');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier le niveau
      await punishmentsPage.expectTextVisible('Niveau 1 appliqué');
      
      // Deuxième application (escalade automatique)
      await punishmentsPage.applyPunishment(0, 0);
      await punishmentsPage.expectTextVisible('Escalade vers niveau 2');
      await punishmentsPage.tapElement('confirm-escalation');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'escalade
      await punishmentsPage.expectTextVisible('Niveau 2 appliqué');
      await punishmentsPage.expectElementVisible('escalated-punishment-badge');
    });

    it('should prevent duplicate active punishments', async () => {
      // Appliquer une première punition
      await punishmentsPage.applyPunishment(0, 0);
      await punishmentsPage.tapElement('confirm-apply-punishment');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Essayer d'appliquer la même punition à nouveau
      await punishmentsPage.applyPunishment(0, 0);
      
      // Vérifier la prévention
      await punishmentsPage.expectTextVisible('Cette punition est déjà active');
      await punishmentsPage.expectElementVisible('duplicate-prevention-warning');
    });

    it('should schedule future punishment', async () => {
      await punishmentsPage.tapElement('punishment-card-0');
      await punishmentsPage.tapElement('schedule-punishment-toggle');
      
      // Définir une date future
      await punishmentsPage.tapElement('scheduled-date-picker');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await punishmentsPage.tapElement(`date-${tomorrow.getDate()}`);
      
      // Définir l'heure
      await punishmentsPage.tapElement('scheduled-time-picker');
      await punishmentsPage.tapElement('time-18-00');
      
      await punishmentsPage.tapElement('apply-to-child-button');
      await punishmentsPage.tapElement('child-selector');
      await punishmentsPage.tapElement('child-option-0');
      
      await punishmentsPage.tapElement('confirm-schedule-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la programmation
      await punishmentsPage.expectTextVisible('Punition programmée');
      await punishmentsPage.expectElementVisible('scheduled-punishment-badge');
    });
  });

  describe('Active Punishments Management', () => {
    beforeEach(async () => {
      // Créer et appliquer des punitions actives
      await setupActivePunishments();
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
      await dashboardPage.tapElement('view-active-punishments-button');
    });

    it('should display active punishments', async () => {
      await punishmentsPage.expectElementVisible('active-punishments-list');
      await punishmentsPage.expectTextVisible('Punitions actives');
      await punishmentsPage.expectElementVisible('punishment-timer-0');
    });

    it('should show punishment details and countdown', async () => {
      // Ouvrir les détails
      await punishmentsPage.tapElement('active-punishment-card-0');
      
      // Vérifier les détails
      await punishmentsPage.expectElementVisible('punishment-detail-screen');
      await punishmentsPage.expectTextVisible('Temps restant:');
      await punishmentsPage.expectElementVisible('countdown-timer');
      await punishmentsPage.expectTextVisible('Raison:');
      await punishmentsPage.expectTextVisible('Appliquée le:');
    });

    it('should lift punishment early with justification', async () => {
      // Lever la punition
      await punishmentsPage.tapElement('active-punishment-card-0');
      await punishmentsPage.tapElement('lift-punishment-button');
      
      // Ajouter une justification
      await punishmentsPage.typeText('lift-reason-input', 'Bon comportement démontré');
      await punishmentsPage.tapElement('confirm-lift-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la levée
      await punishmentsPage.expectTextVisible('Punition levée');
      await punishmentsPage.expectElementVisible('punishment-lifted-notification');
    });

    it('should modify active punishment duration', async () => {
      await punishmentsPage.tapElement('active-punishment-card-0');
      await punishmentsPage.tapElement('modify-punishment-button');
      
      // Ajuster la durée
      await punishmentsPage.tapElement('extend-duration-button');
      await punishmentsPage.typeText('additional-hours-input', '6');
      await punishmentsPage.typeText('modification-reason-input', 'Comportement récidivant');
      
      await punishmentsPage.tapElement('confirm-modification-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la modification
      await punishmentsPage.expectTextVisible('Durée de punition modifiée');
      await punishmentsPage.expectElementVisible('extended-punishment-badge');
    });

    it('should handle punishment expiration', async () => {
      // Simuler l'expiration d'une punition
      await device.setSystemTime(Date.now() + 25 * 60 * 60 * 1000); // 25 heures plus tard
      await device.reloadReactNative();
      
      // Vérifier la gestion de l'expiration
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
      
      // Devrait montrer l'historique au lieu des punitions actives
      await dashboardPage.expectElementNotVisible('active-punishments-indicator');
      await dashboardPage.expectElementVisible('punishment-history-link');
    });

    it('should show punishment impact on child activities', async () => {
      // Vérifier l'impact sur les récompenses
      await switchToChildView();
      await navigationHelper.navigateToTab('rewards');
      
      // Certaines récompenses devraient être bloquées
      await punishmentsPage.expectElementVisible('restricted-reward-indicator');
      await punishmentsPage.expectTextVisible('Bloqué par punition active');
      
      // Vérifier l'impact sur les missions
      await navigationHelper.navigateToTab('missions');
      await punishmentsPage.expectElementVisible('punishment-reminder');
      await punishmentsPage.expectTextVisible('Tu as des restrictions actives');
    });
  });

  describe('Punishment History and Analytics', () => {
    beforeEach(async () => {
      await setupPunishmentHistory();
      await navigationHelper.navigateToTab('punishments');
    });

    it('should display punishment history', async () => {
      // Ouvrir l'historique
      await punishmentsPage.tapElement('punishment-history-button');
      
      // Vérifier l'affichage
      await punishmentsPage.expectElementVisible('punishment-history-screen');
      await punishmentsPage.expectElementVisible('history-timeline');
      await punishmentsPage.expectElementVisible('completed-punishments-list');
    });

    it('should filter punishment history', async () => {
      await punishmentsPage.tapElement('punishment-history-button');
      
      // Filtrer par enfant
      await punishmentsPage.tapElement('child-filter-button');
      await punishmentsPage.tapElement('filter-child-0');
      
      // Filtrer par période
      await punishmentsPage.tapElement('date-filter-button');
      await punishmentsPage.tapElement('filter-last-month');
      
      // Filtrer par catégorie
      await punishmentsPage.tapElement('category-filter-button');
      await punishmentsPage.tapElement('filter-digital-punishments');
      
      // Vérifier les résultats filtrés
      await punishmentsPage.expectElementVisible('filtered-history-results');
      await punishmentsPage.expectTextVisible('Historique filtré');
    });

    it('should show punishment effectiveness analytics', async () => {
      // Ouvrir les analytics
      await punishmentsPage.tapElement('punishment-analytics-button');
      
      // Vérifier les statistiques
      await punishmentsPage.expectElementVisible('analytics-dashboard');
      await punishmentsPage.expectTextVisible('Efficacité des punitions');
      await punishmentsPage.expectElementVisible('recurrence-rate-chart');
      await punishmentsPage.expectElementVisible('behavior-improvement-graph');
      await punishmentsPage.expectTextVisible('Punitions les plus utilisées');
    });

    it('should generate punishment reports', async () => {
      await punishmentsPage.tapElement('punishment-analytics-button');
      
      // Générer un rapport
      await punishmentsPage.tapElement('generate-report-button');
      
      // Configurer le rapport
      await punishmentsPage.tapElement('report-period-selector');
      await punishmentsPage.tapElement('period-last-3-months');
      
      await punishmentsPage.tapElement('include-charts-toggle');
      await punishmentsPage.tapElement('include-recommendations-toggle');
      
      await punishmentsPage.tapElement('generate-pdf-button');
      
      // Vérifier la génération
      await punishmentsPage.expectTextVisible('Rapport généré');
      await punishmentsPage.expectElementVisible('download-report-button');
    });

    it('should provide behavior improvement suggestions', async () => {
      await punishmentsPage.tapElement('punishment-analytics-button');
      
      // Voir les recommandations
      await punishmentsPage.tapElement('improvement-suggestions-tab');
      
      // Vérifier les suggestions
      await punishmentsPage.expectElementVisible('suggestions-list');
      await punishmentsPage.expectTextVisible('Recommandations personnalisées');
      await punishmentsPage.expectElementVisible('alternative-approach-card');
      await punishmentsPage.expectElementVisible('positive-reinforcement-tip');
    });
  });

  describe('Child View - Punishment Experience', () => {
    beforeEach(async () => {
      await setupActivePunishments();
      await switchToChildView();
    });

    it('should display active restrictions to child', async () => {
      // Vérifier l'affichage des restrictions
      await dashboardPage.expectElementVisible('restriction-banner');
      await dashboardPage.expectTextVisible('Tu as des restrictions actives');
      
      // Voir les détails
      await dashboardPage.tapElement('view-restrictions-button');
      await punishmentsPage.expectElementVisible('child-restrictions-screen');
      await punishmentsPage.expectTextVisible('Pourquoi j\'ai cette punition');
      await punishmentsPage.expectElementVisible('restriction-timer');
    });

    it('should allow child to view punishment reason', async () => {
      await dashboardPage.tapElement('view-restrictions-button');
      
      // Voir la raison
      await punishmentsPage.tapElement('why-punishment-button');
      
      // Vérifier l'explication adaptée à l'enfant
      await punishmentsPage.expectElementVisible('punishment-explanation');
      await punishmentsPage.expectTextVisible('Comportement à améliorer');
      await punishmentsPage.expectElementVisible('learning-tip');
    });

    it('should show punishment progress and countdown', async () => {
      await dashboardPage.tapElement('view-restrictions-button');
      
      // Vérifier l'affichage du progrès
      await punishmentsPage.expectElementVisible('punishment-progress-bar');
      await punishmentsPage.expectElementVisible('time-remaining-display');
      await punishmentsPage.expectTextVisible('Temps restant:');
      
      // Vérifier les encouragements
      await punishmentsPage.expectElementVisible('encouragement-message');
      await punishmentsPage.expectTextVisible('Tu peux le faire !');
    });

    it('should handle good behavior reporting', async () => {
      await dashboardPage.tapElement('view-restrictions-button');
      
      // Rapporter un bon comportement
      await punishmentsPage.tapElement('report-good-behavior-button');
      
      // Sélectionner le type de bon comportement
      await punishmentsPage.tapElement('behavior-selector');
      await punishmentsPage.tapElement('behavior-helping-others');
      
      // Ajouter une note
      await punishmentsPage.typeText('behavior-note-input', 'J\'ai aidé ma sœur avec ses devoirs');
      
      // Optionnel: Ajouter une photo
      await punishmentsPage.tapElement('add-photo-toggle');
      await punishmentsPage.tapElement('take-photo-button');
      
      await punishmentsPage.tapElement('submit-behavior-report');
      
      // Vérifier l'envoi
      await punishmentsPage.expectTextVisible('Rapport envoyé aux parents');
      await punishmentsPage.expectElementVisible('behavior-report-confirmation');
    });

    it('should show restricted features clearly', async () => {
      // Vérifier les restrictions dans l'app
      await navigationHelper.navigateToTab('rewards');
      
      // Certaines récompenses devraient être bloquées
      await punishmentsPage.expectElementVisible('blocked-reward-overlay');
      await punishmentsPage.expectTextVisible('Bloqué par punition');
      
      // Mais pas toutes les récompenses
      await punishmentsPage.expectElementVisible('available-reward-card');
    });
  });

  describe('Punishment Templates and Presets', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('punishments');
    });

    it('should use built-in punishment templates', async () => {
      // Ouvrir les templates
      await punishmentsPage.tapElement('punishment-templates-button');
      
      // Sélectionner un template
      await punishmentsPage.expectElementVisible('templates-list');
      await punishmentsPage.tapElement('template-screen-time-limit');
      
      // Personnaliser le template
      await punishmentsPage.tapElement('customize-template-button');
      await punishmentsPage.typeText('template-title-input', 'Limitation écran personnalisée');
      await punishmentsPage.typeText('custom-duration-input', '4');
      
      await punishmentsPage.tapElement('create-from-template-button');
      
      // Vérifier la création
      await punishmentsPage.expectTextVisible('Punition créée à partir du template');
    });

    it('should create age-appropriate punishment recommendations', async () => {
      // Ouvrir les recommandations
      await punishmentsPage.tapElement('get-recommendations-button');
      
      // Sélectionner l'enfant
      await punishmentsPage.tapElement('child-selector');
      await punishmentsPage.tapElement('child-option-0'); // Enfant de 8 ans
      
      // Sélectionner le type de problème
      await punishmentsPage.tapElement('behavior-issue-selector');
      await punishmentsPage.tapElement('issue-not-listening');
      
      // Voir les recommandations
      await punishmentsPage.tapElement('get-suggestions-button');
      
      // Vérifier les suggestions adaptées
      await punishmentsPage.expectElementVisible('age-appropriate-suggestions');
      await punishmentsPage.expectTextVisible('Recommandé pour 6-8 ans');
      await punishmentsPage.expectElementVisible('gentle-consequence-card');
      await punishmentsPage.expectElementNotVisible('harsh-punishment-option');
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

  async function createTestPunishments() {
    await navigationHelper.navigateToTab('punishments');
    await punishmentsPage.createPunishment(TestData.punishments.light);
    await punishmentsPage.createPunishment(TestData.punishments.strict);
  }

  async function createGraduatedPunishment() {
    await punishmentsPage.tapCreatePunishment();
    await punishmentsPage.typeText('punishment-title-input', 'Punition progressive');
    await punishmentsPage.typeText('punishment-description-input', 'Devient plus stricte à chaque récidive');
    await punishmentsPage.tapElement('graduated-punishment-toggle');
    await punishmentsPage.tapElement('escalation-levels-selector');
    await punishmentsPage.tapElement('levels-3');
    await punishmentsPage.tapElement('punishment-submit-button');
  }

  async function setupActivePunishments() {
    await createTestPunishments();
    await punishmentsPage.applyPunishment(0, 0);
    await punishmentsPage.tapElement('confirm-apply-punishment');
    await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
  }

  async function setupPunishmentHistory() {
    // Créer et compléter plusieurs punitions pour l'historique
    for (let i = 0; i < 5; i++) {
      await setupActivePunishments();
      // Simuler la completion
      await device.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);
    }
    await device.setSystemTime(Date.now()); // Remettre à l'heure actuelle
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
});