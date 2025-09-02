import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  dashboardPage,
  missionsPage,
  navigationHelper,
  pinValidationPage
} from '../utils/page-objects';
import { TestData, TestTimings } from '../utils/test-data';

describe('Missions System', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Se connecter en tant que parent et ajouter un enfant
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
    await addTestChildIfNeeded();
  });

  describe('Mission Creation', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('missions');
      await missionsPage.expectMissionsListVisible();
    });

    it('should create a simple mission successfully', async () => {
      const mission = TestData.missions.simple;
      
      await missionsPage.createMission(mission);
      
      // Vérifier la création
      await missionsPage.expectTextVisible('Mission créée avec succès');
      await missionsPage.expectMissionInList(mission.title);
    });

    it('should create a recurring mission', async () => {
      await missionsPage.tapCreateMission();
      
      // Remplir les détails de base
      await missionsPage.typeText('mission-title-input', TestData.missions.complex.title);
      await missionsPage.typeText('mission-description-input', TestData.missions.complex.description);
      await missionsPage.typeText('mission-points-input', TestData.missions.complex.pointsReward.toString());
      
      // Configurer la récurrence
      await missionsPage.tapElement('mission-recurring-toggle');
      await missionsPage.tapElement('recurring-pattern-selector');
      await missionsPage.tapElement('pattern-daily');
      
      // Sélectionner la catégorie et difficulté
      await missionsPage.tapElement('category-selector');
      await missionsPage.tapElement('category-educational');
      
      await missionsPage.tapElement('difficulty-selector');
      await missionsPage.tapElement('difficulty-medium');
      
      // Assigner à un enfant
      await missionsPage.tapElement('assign-child-selector');
      await missionsPage.tapElement('child-option-0');
      
      // Soumettre
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier la création
      await missionsPage.expectTextVisible('Mission récurrente créée');
      await missionsPage.expectElementVisible('recurring-mission-badge');
    });

    it('should validate required fields', async () => {
      await missionsPage.tapCreateMission();
      
      // Essayer de soumettre sans remplir
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier les erreurs
      await missionsPage.expectTextVisible('Le titre est obligatoire');
      await missionsPage.expectTextVisible('La description est obligatoire');
      await missionsPage.expectTextVisible('Les points sont obligatoires');
    });

    it('should validate points range', async () => {
      await missionsPage.tapCreateMission();
      
      await missionsPage.typeText('mission-title-input', 'Test Mission');
      await missionsPage.typeText('mission-description-input', 'Description test');
      await missionsPage.typeText('mission-points-input', '0'); // Points invalides
      
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier l'erreur
      await missionsPage.expectTextVisible('Les points doivent être supérieurs à 0');
    });

    it('should create age-appropriate mission', async () => {
      await missionsPage.tapCreateMission();
      
      // Remplir les détails
      await missionsPage.typeText('mission-title-input', 'Mission pour enfant de 8 ans');
      await missionsPage.typeText('mission-description-input', 'Description adaptée');
      await missionsPage.typeText('mission-points-input', '15');
      
      // Sélectionner groupe d'âge
      await missionsPage.tapElement('age-group-selector');
      await missionsPage.tapElement('age-group-6-8');
      
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier que la mission est créée pour le bon groupe
      await missionsPage.expectTextVisible('Mission créée pour 6-8 ans');
    });

    it('should set mission deadline', async () => {
      await missionsPage.tapCreateMission();
      
      // Remplir les détails de base
      await missionsPage.typeText('mission-title-input', 'Mission avec deadline');
      await missionsPage.typeText('mission-description-input', 'Description');
      await missionsPage.typeText('mission-points-input', '20');
      
      // Définir une deadline
      await missionsPage.tapElement('set-deadline-toggle');
      await missionsPage.tapElement('deadline-picker');
      
      // Sélectionner demain
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await missionsPage.tapElement(`date-${tomorrow.getDate()}`);
      
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier la deadline
      await missionsPage.expectElementVisible('mission-deadline-badge');
      await missionsPage.expectTextVisible('Deadline:');
    });
  });

  describe('Mission Assignment', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('missions');
      // Créer une mission de test
      await missionsPage.createMission(TestData.missions.simple);
    });

    it('should assign mission to specific child', async () => {
      // Ouvrir la mission
      await missionsPage.tapMissionCard(0);
      
      // Assigner à un enfant
      await missionsPage.tapElement('assign-mission-button');
      await missionsPage.tapElement('child-selector');
      await missionsPage.tapElement('child-option-0');
      
      // Confirmer l'assignation
      await missionsPage.tapElement('confirm-assignment-button');
      
      // Vérifier l'assignation
      await missionsPage.expectTextVisible('Mission assignée');
      await missionsPage.expectElementVisible('assigned-child-badge');
    });

    it('should assign mission to multiple children', async () => {
      // Créer plusieurs enfants d'abord
      await addMultipleTestChildren();
      
      // Ouvrir la mission
      await missionsPage.tapMissionCard(0);
      
      // Assigner à plusieurs enfants
      await missionsPage.tapElement('assign-mission-button');
      await missionsPage.tapElement('multiple-assignment-toggle');
      
      await missionsPage.tapElement('child-checkbox-0');
      await missionsPage.tapElement('child-checkbox-1');
      
      await missionsPage.tapElement('confirm-assignment-button');
      
      // Vérifier les assignations
      await missionsPage.expectTextVisible('Mission assignée à 2 enfants');
    });

    it('should auto-assign mission based on age group', async () => {
      await missionsPage.tapCreateMission();
      
      // Créer une mission pour un groupe d'âge spécifique
      await missionsPage.typeText('mission-title-input', 'Mission auto-assignée');
      await missionsPage.typeText('mission-description-input', 'Description');
      await missionsPage.typeText('mission-points-input', '15');
      
      // Activer l'auto-assignation
      await missionsPage.tapElement('auto-assign-toggle');
      await missionsPage.tapElement('age-group-selector');
      await missionsPage.tapElement('age-group-6-8');
      
      await missionsPage.tapElement('mission-submit-button');
      
      // Vérifier l'auto-assignation
      await missionsPage.expectTextVisible('Mission auto-assignée aux enfants de 6-8 ans');
    });
  });

  describe('Mission Completion (Child View)', () => {
    beforeEach(async () => {
      // Créer et assigner une mission
      await setupAssignedMission();
      
      // Se connecter en tant qu'enfant (simulé)
      await switchToChildView();
    });

    it('should display assigned missions', async () => {
      await navigationHelper.navigateToTab('missions');
      
      // Vérifier l'affichage des missions
      await missionsPage.expectElementVisible('child-missions-list');
      await missionsPage.expectTextVisible(TestData.missions.simple.title);
      await missionsPage.expectElementVisible('mission-progress-indicator');
    });

    it('should complete a mission', async () => {
      await navigationHelper.navigateToTab('missions');
      
      // Compléter la mission
      await missionsPage.completeMission(0);
      
      // Vérifier la completion
      await missionsPage.expectTextVisible('Mission terminée !');
      await missionsPage.expectElementVisible('completion-celebration');
      
      // Vérifier que les points sont ajoutés
      await missionsPage.expectTextVisible(`+${TestData.missions.simple.pointsReward} points`);
    });

    it('should show mission details', async () => {
      await navigationHelper.navigateToTab('missions');
      
      // Ouvrir les détails
      await missionsPage.tapMissionCard(0);
      
      // Vérifier les détails
      await missionsPage.expectElementVisible('mission-detail-screen');
      await missionsPage.expectTextVisible(TestData.missions.simple.description);
      await missionsPage.expectTextVisible(`Récompense: ${TestData.missions.simple.pointsReward} points`);
      await missionsPage.expectElementVisible('start-mission-button');
    });

    it('should start and track mission progress', async () => {
      await navigationHelper.navigateToTab('missions');
      await missionsPage.tapMissionCard(0);
      
      // Démarrer la mission
      await missionsPage.tapElement('start-mission-button');
      
      // Vérifier le démarrage
      await missionsPage.expectTextVisible('Mission démarrée');
      await missionsPage.expectElementVisible('mission-timer');
      await missionsPage.expectElementVisible('complete-mission-button');
    });

    it('should handle mission with photo proof', async () => {
      // Créer une mission nécessitant une photo
      await createMissionWithPhotoProof();
      
      await navigationHelper.navigateToTab('missions');
      await missionsPage.tapMissionCard(0);
      
      // Démarrer la mission
      await missionsPage.tapElement('start-mission-button');
      
      // Compléter avec photo
      await missionsPage.tapElement('complete-with-photo-button');
      await missionsPage.tapElement('take-photo-button');
      
      // Simuler la prise de photo
      await device.takePhoto();
      
      // Confirmer
      await missionsPage.tapElement('confirm-photo-button');
      
      // Vérifier la soumission
      await missionsPage.expectTextVisible('Mission soumise pour validation');
      await missionsPage.expectElementVisible('pending-validation-badge');
    });
  });

  describe('Mission Validation (Parent View)', () => {
    beforeEach(async () => {
      // Créer une mission complétée nécessitant validation
      await setupCompletedMissionForValidation();
      await navigationHelper.navigateToTab('validations');
    });

    it('should display pending validations', async () => {
      await missionsPage.expectElementVisible('validations-list');
      await missionsPage.expectElementVisible('mission-validation-card-0');
      await missionsPage.expectTextVisible('En attente de validation');
    });

    it('should validate mission completion', async () => {
      // Ouvrir la validation
      await missionsPage.tapElement('mission-validation-card-0');
      
      // Vérifier les détails
      await missionsPage.expectElementVisible('validation-detail-screen');
      await missionsPage.expectTextVisible('Mission terminée par');
      
      // Valider
      await missionsPage.tapElement('validate-completion-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la validation
      await missionsPage.expectTextVisible('Mission validée');
      await missionsPage.expectTextVisible('Points attribués');
    });

    it('should reject mission completion', async () => {
      // Ouvrir la validation
      await missionsPage.tapElement('mission-validation-card-0');
      
      // Rejeter
      await missionsPage.tapElement('reject-completion-button');
      
      // Ajouter une raison
      await missionsPage.typeText('rejection-reason-input', 'Travail incomplet');
      await missionsPage.tapElement('confirm-rejection-button');
      
      // PIN requis
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier le rejet
      await missionsPage.expectTextVisible('Mission rejetée');
    });

    it('should view photo proof in validation', async () => {
      // Créer une mission avec photo
      await setupMissionWithPhoto();
      
      // Ouvrir la validation
      await missionsPage.tapElement('mission-validation-card-0');
      
      // Voir la photo
      await missionsPage.tapElement('view-photo-proof-button');
      
      // Vérifier l'affichage
      await missionsPage.expectElementVisible('photo-proof-modal');
      await missionsPage.expectElementVisible('mission-photo');
      await missionsPage.expectElementVisible('photo-timestamp');
    });
  });

  describe('Recurring Missions', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('missions');
      // Créer une mission récurrente
      await createRecurringMission();
    });

    it('should generate daily recurring instances', async () => {
      // Vérifier que l'instance du jour est créée
      await missionsPage.expectElementVisible('recurring-mission-today');
      await missionsPage.expectTextVisible('Aujourd\'hui');
      
      // Simuler le passage à demain
      await device.setSystemTime(Date.now() + 24 * 60 * 60 * 1000);
      await device.reloadReactNative();
      
      // Vérifier qu'une nouvelle instance est créée
      await navigationHelper.navigateToTab('missions');
      await missionsPage.expectElementVisible('recurring-mission-today');
      await missionsPage.expectElementVisible('recurring-mission-yesterday');
    });

    it('should maintain streak for recurring missions', async () => {
      // Compléter la mission aujourd'hui
      await switchToChildView();
      await navigationHelper.navigateToTab('missions');
      await missionsPage.completeMission(0);
      
      // Vérifier le streak
      await missionsPage.expectElementVisible('mission-streak-counter');
      await missionsPage.expectTextVisible('Série: 1 jour');
    });

    it('should handle missed recurring missions', async () => {
      // Simuler le passage de temps sans compléter
      await device.setSystemTime(Date.now() + 48 * 60 * 60 * 1000);
      await device.reloadReactNative();
      
      // Vérifier l'affichage des missions manquées
      await switchToChildView();
      await navigationHelper.navigateToTab('missions');
      await missionsPage.expectElementVisible('missed-mission-indicator');
      await missionsPage.expectTextVisible('Mission manquée');
    });
  });

  describe('Mission Templates', () => {
    beforeEach(async () => {
      await navigationHelper.navigateToTab('missions');
    });

    it('should create mission from template', async () => {
      await missionsPage.tapElement('mission-templates-button');
      
      // Sélectionner un template
      await missionsPage.expectElementVisible('templates-list');
      await missionsPage.tapElement('template-household-chores');
      
      // Personnaliser le template
      await missionsPage.expectElementVisible('template-customization');
      await missionsPage.tapElement('use-template-button');
      
      // Vérifier la création
      await missionsPage.expectTextVisible('Mission créée à partir du template');
    });

    it('should save custom mission as template', async () => {
      // Créer une mission personnalisée
      await missionsPage.createMission(TestData.missions.simple);
      
      // Sauvegarder comme template
      await missionsPage.tapMissionCard(0);
      await missionsPage.tapElement('save-as-template-button');
      
      await missionsPage.typeText('template-name-input', 'Mon Template Personnalisé');
      await missionsPage.tapElement('save-template-button');
      
      // Vérifier la sauvegarde
      await missionsPage.expectTextVisible('Template sauvegardé');
    });
  });

  // Helpers
  async function addTestChildIfNeeded() {
    try {
      await dashboardPage.expectElementVisible('no-children-message');
      // Ajouter un enfant de test
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

  async function addMultipleTestChildren() {
    // Ajouter 2-3 enfants de test avec des âges différents
    const children = [
      { firstName: 'Emma', lastName: 'Test', age: 7, pin: '1111' },
      { firstName: 'Lucas', lastName: 'Test', age: 12, pin: '2222' },
    ];

    for (const child of children) {
      await dashboardPage.tapAddChild();
      await dashboardPage.typeText('child-first-name-input', child.firstName);
      await dashboardPage.typeText('child-last-name-input', child.lastName);
      await dashboardPage.typeText('child-age-input', child.age.toString());
      await dashboardPage.typeText('child-pin-input', child.pin);
      await dashboardPage.typeText('child-pin-confirm-input', child.pin);
      await dashboardPage.tapElement('add-child-submit-button');
    }
  }

  async function setupAssignedMission() {
    await navigationHelper.navigateToTab('missions');
    await missionsPage.createMission(TestData.missions.simple);
    await missionsPage.tapMissionCard(0);
    await missionsPage.tapElement('assign-mission-button');
    await missionsPage.tapElement('child-selector');
    await missionsPage.tapElement('child-option-0');
    await missionsPage.tapElement('confirm-assignment-button');
  }

  async function switchToChildView() {
    // Simuler la connexion enfant (à adapter selon l'implémentation)
    await dashboardPage.tapElement('switch-to-child-view-button');
    // ou se déconnecter et se connecter en tant qu'enfant
  }

  async function createRecurringMission() {
    await missionsPage.tapCreateMission();
    await missionsPage.typeText('mission-title-input', 'Mission quotidienne');
    await missionsPage.typeText('mission-description-input', 'À faire tous les jours');
    await missionsPage.typeText('mission-points-input', '10');
    await missionsPage.tapElement('mission-recurring-toggle');
    await missionsPage.tapElement('recurring-pattern-selector');
    await missionsPage.tapElement('pattern-daily');
    await missionsPage.tapElement('mission-submit-button');
  }

  async function createMissionWithPhotoProof() {
    await navigationHelper.navigateToTab('missions');
    await missionsPage.tapCreateMission();
    await missionsPage.typeText('mission-title-input', 'Mission avec photo');
    await missionsPage.typeText('mission-description-input', 'Prendre une photo comme preuve');
    await missionsPage.typeText('mission-points-input', '25');
    await missionsPage.tapElement('photo-proof-toggle');
    await missionsPage.tapElement('mission-submit-button');
  }

  async function setupCompletedMissionForValidation() {
    // Créer, assigner et compléter une mission nécessitant validation
    await setupAssignedMission();
    await switchToChildView();
    await navigationHelper.navigateToTab('missions');
    await missionsPage.tapElement('complete-mission-button');
    // Retour en vue parent
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
  }

  async function setupMissionWithPhoto() {
    await createMissionWithPhotoProof();
    await setupAssignedMission();
    // Simuler completion avec photo
    await switchToChildView();
    await navigationHelper.navigateToTab('missions');
    await missionsPage.tapElement('complete-with-photo-button');
    // Retour en vue parent
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
  }
});