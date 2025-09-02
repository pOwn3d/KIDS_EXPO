import { device } from 'detox';
import { 
  welcomePage, 
  loginPage, 
  dashboardPage,
  navigationHelper,
  pinValidationPage
} from '../utils/page-objects';
import { TestData, TestTimings } from '../utils/test-data';

describe('Children Management', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Se connecter en tant que parent
    await welcomePage.tapLogin();
    await loginPage.loginAsParent();
    await dashboardPage.expectParentDashboardVisible();
  });

  describe('Add Child', () => {
    it('should add a new child successfully', async () => {
      // Ouvrir le modal d'ajout d'enfant
      await dashboardPage.tapAddChild();
      
      // Remplir le formulaire
      await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
      await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
      await dashboardPage.typeText('child-age-input', TestData.users.child.age.toString());
      
      // Sélectionner le groupe d'âge approprié
      await dashboardPage.tapElement('age-group-selector');
      await dashboardPage.tapElement('age-group-6-8'); // Pour un enfant de 8 ans
      
      // Configurer le PIN enfant
      await dashboardPage.typeText('child-pin-input', TestData.users.child.pin);
      await dashboardPage.typeText('child-pin-confirm-input', TestData.users.child.pin);
      
      // Soumettre
      await dashboardPage.tapElement('add-child-submit-button');
      
      // Vérifier le succès
      await dashboardPage.expectTextVisible('Enfant ajouté avec succès');
      
      // Vérifier que l'enfant apparaît dans la liste
      await navigationHelper.navigateToTab('children');
      await dashboardPage.expectTextVisible(TestData.users.child.firstName);
    });

    it('should validate required fields when adding child', async () => {
      await dashboardPage.tapAddChild();
      
      // Essayer de soumettre sans remplir les champs
      await dashboardPage.tapElement('add-child-submit-button');
      
      // Vérifier les erreurs de validation
      await dashboardPage.expectTextVisible('Le prénom est obligatoire');
      await dashboardPage.expectTextVisible('Le nom est obligatoire');
      await dashboardPage.expectTextVisible('L\'âge est obligatoire');
    });

    it('should validate age range', async () => {
      await dashboardPage.tapAddChild();
      
      // Entrer un âge invalide
      await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
      await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
      await dashboardPage.typeText('child-age-input', '25'); // Âge trop élevé
      
      await dashboardPage.tapElement('add-child-submit-button');
      
      // Vérifier l'erreur
      await dashboardPage.expectTextVisible('L\'âge doit être entre 3 et 17 ans');
    });

    it('should validate PIN requirements', async () => {
      await dashboardPage.tapAddChild();
      
      // Remplir les champs de base
      await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
      await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
      await dashboardPage.typeText('child-age-input', TestData.users.child.age.toString());
      
      // Entrer un PIN trop court
      await dashboardPage.typeText('child-pin-input', '12');
      await dashboardPage.tapElement('add-child-submit-button');
      
      // Vérifier l'erreur
      await dashboardPage.expectTextVisible('Le PIN doit contenir 4 chiffres');
    });

    it('should validate PIN confirmation match', async () => {
      await dashboardPage.tapAddChild();
      
      // Remplir les champs de base
      await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
      await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
      await dashboardPage.typeText('child-age-input', TestData.users.child.age.toString());
      
      // Entrer des PINs qui ne correspondent pas
      await dashboardPage.typeText('child-pin-input', '1234');
      await dashboardPage.typeText('child-pin-confirm-input', '5678');
      
      await dashboardPage.tapElement('add-child-submit-button');
      
      // Vérifier l'erreur
      await dashboardPage.expectTextVisible('Les codes PIN ne correspondent pas');
    });

    it('should automatically select age group based on age', async () => {
      await dashboardPage.tapAddChild();
      
      // Entrer un âge
      await dashboardPage.typeText('child-age-input', '10');
      
      // Le groupe d'âge devrait être sélectionné automatiquement
      await dashboardPage.expectElementVisible('age-group-9-12-selected');
    });
  });

  describe('Children List', () => {
    beforeEach(async () => {
      // Ajouter un enfant pour les tests
      await addTestChild();
      await navigationHelper.navigateToTab('children');
    });

    it('should display children list', async () => {
      await dashboardPage.expectElementVisible('children-list');
      await dashboardPage.expectTextVisible(TestData.users.child.firstName);
    });

    it('should show child details', async () => {
      // Taper sur un enfant
      await dashboardPage.tapElement('child-card-0');
      
      // Vérifier les détails
      await dashboardPage.expectElementVisible('child-profile-screen');
      await dashboardPage.expectTextVisible(TestData.users.child.firstName);
      await dashboardPage.expectTextVisible(`${TestData.users.child.age} ans`);
      await dashboardPage.expectTextVisible('Points actuels');
    });

    it('should display child statistics', async () => {
      await dashboardPage.tapElement('child-card-0');
      
      // Vérifier les statistiques
      await dashboardPage.expectElementVisible('child-stats');
      await dashboardPage.expectElementVisible('missions-completed-count');
      await dashboardPage.expectElementVisible('rewards-claimed-count');
      await dashboardPage.expectElementVisible('current-level');
    });

    it('should show empty state when no children', async () => {
      // Supprimer tous les enfants
      await removeAllChildren();
      
      // Vérifier l'état vide
      await dashboardPage.expectElementVisible('no-children-message');
      await dashboardPage.expectTextVisible('Aucun enfant ajouté');
      await dashboardPage.expectElementVisible('add-first-child-button');
    });
  });

  describe('Edit Child', () => {
    beforeEach(async () => {
      await addTestChild();
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
    });

    it('should edit child information', async () => {
      // Ouvrir l'édition
      await dashboardPage.tapElement('edit-child-button');
      
      // Modifier les informations
      await dashboardPage.typeText('child-first-name-input', 'Nouveau Prénom');
      await dashboardPage.typeText('child-age-input', '9');
      
      // Valider avec PIN
      await dashboardPage.tapElement('save-changes-button');
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier les modifications
      await dashboardPage.expectTextVisible('Modifications sauvegardées');
      await dashboardPage.expectTextVisible('Nouveau Prénom');
      await dashboardPage.expectTextVisible('9 ans');
    });

    it('should require PIN for sensitive changes', async () => {
      // Ouvrir l'édition
      await dashboardPage.tapElement('edit-child-button');
      
      // Changer le PIN
      await dashboardPage.tapElement('change-child-pin-button');
      await dashboardPage.typeText('new-child-pin-input', '5678');
      await dashboardPage.typeText('confirm-new-child-pin-input', '5678');
      
      await dashboardPage.tapElement('update-pin-button');
      
      // Devrait demander validation parent
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.expectTextVisible('Confirmer le changement de PIN');
    });

    it('should update age group when age changes', async () => {
      // Ouvrir l'édition
      await dashboardPage.tapElement('edit-child-button');
      
      // Changer l'âge pour un groupe différent
      await dashboardPage.typeText('child-age-input', '15');
      
      // Le groupe d'âge devrait se mettre à jour
      await dashboardPage.expectElementVisible('age-group-13-17-selected');
      
      // Sauvegarder
      await dashboardPage.tapElement('save-changes-button');
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier que le groupe d'âge a changé
      await dashboardPage.expectTextVisible('Adolescent (13-17 ans)');
    });
  });

  describe('Points Management', () => {
    beforeEach(async () => {
      await addTestChild();
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
    });

    it('should manually add points to child', async () => {
      // Ouvrir gestion des points
      await dashboardPage.tapElement('manage-points-button');
      
      // Ajouter des points
      await dashboardPage.typeText('points-adjustment-input', '50');
      await dashboardPage.typeText('points-reason-input', 'Bon comportement');
      await dashboardPage.tapElement('add-points-button');
      
      // Valider avec PIN
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier l'ajout
      await dashboardPage.expectTextVisible('Points ajoutés');
      await dashboardPage.expectTextVisible('+50 points');
    });

    it('should manually remove points from child', async () => {
      // Ouvrir gestion des points
      await dashboardPage.tapElement('manage-points-button');
      
      // Retirer des points
      await dashboardPage.typeText('points-adjustment-input', '25');
      await dashboardPage.typeText('points-reason-input', 'Correction de comportement');
      await dashboardPage.tapElement('remove-points-button');
      
      // Valider avec PIN
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la déduction
      await dashboardPage.expectTextVisible('Points retirés');
      await dashboardPage.expectTextVisible('-25 points');
    });

    it('should show points history', async () => {
      // Ouvrir l'historique des points
      await dashboardPage.tapElement('points-history-button');
      
      // Vérifier l'affichage de l'historique
      await dashboardPage.expectElementVisible('points-history-list');
      await dashboardPage.expectElementVisible('points-entry-0');
      
      // Vérifier les détails d'une entrée
      await dashboardPage.tapElement('points-entry-0');
      await dashboardPage.expectElementVisible('points-detail-modal');
      await dashboardPage.expectTextVisible('Détails de la transaction');
    });

    it('should prevent negative points balance', async () => {
      // Ouvrir gestion des points
      await dashboardPage.tapElement('manage-points-button');
      
      // Essayer de retirer plus de points que disponible
      await dashboardPage.typeText('points-adjustment-input', '1000');
      await dashboardPage.tapElement('remove-points-button');
      
      // Devrait afficher une erreur
      await dashboardPage.expectTextVisible('Points insuffisants');
      await dashboardPage.expectElementVisible('insufficient-points-error');
    });
  });

  describe('Child Deletion', () => {
    beforeEach(async () => {
      await addTestChild();
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
    });

    it('should delete child with confirmation', async () => {
      // Ouvrir les options
      await dashboardPage.tapElement('child-options-button');
      await dashboardPage.tapElement('delete-child-button');
      
      // Confirmer la suppression
      await dashboardPage.expectElementVisible('delete-confirmation-modal');
      await dashboardPage.expectTextVisible('Êtes-vous sûr ?');
      
      // Valider avec PIN
      await dashboardPage.tapElement('confirm-delete-button');
      await pinValidationPage.expectPinModalVisible();
      await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
      
      // Vérifier la suppression
      await dashboardPage.expectTextVisible('Enfant supprimé');
      await navigationHelper.navigateToTab('children');
      await dashboardPage.expectElementVisible('no-children-message');
    });

    it('should cancel child deletion', async () => {
      // Ouvrir les options
      await dashboardPage.tapElement('child-options-button');
      await dashboardPage.tapElement('delete-child-button');
      
      // Annuler
      await dashboardPage.tapElement('cancel-delete-button');
      
      // Vérifier que l'enfant est toujours là
      await dashboardPage.expectTextVisible(TestData.users.child.firstName);
    });
  });

  describe('Child Profile Customization', () => {
    beforeEach(async () => {
      await addTestChild();
      await navigationHelper.navigateToTab('children');
      await dashboardPage.tapElement('child-card-0');
    });

    it('should customize child avatar', async () => {
      // Ouvrir personnalisation
      await dashboardPage.tapElement('customize-profile-button');
      
      // Changer l'avatar
      await dashboardPage.tapElement('avatar-selector');
      await dashboardPage.tapElement('avatar-option-2');
      
      // Sauvegarder
      await dashboardPage.tapElement('save-customization-button');
      
      // Vérifier le changement
      await dashboardPage.expectElementVisible('avatar-2-selected');
    });

    it('should set child preferences', async () => {
      // Ouvrir les préférences
      await dashboardPage.tapElement('child-preferences-button');
      
      // Configurer les préférences
      await dashboardPage.tapElement('favorite-activity-selector');
      await dashboardPage.tapElement('activity-sports');
      
      await dashboardPage.tapElement('reward-preference-selector');
      await dashboardPage.tapElement('preference-outdoor-activities');
      
      // Sauvegarder
      await dashboardPage.tapElement('save-preferences-button');
      
      // Vérifier la sauvegarde
      await dashboardPage.expectTextVisible('Préférences sauvegardées');
    });
  });

  // Helpers
  async function addTestChild() {
    await dashboardPage.tapAddChild();
    await dashboardPage.typeText('child-first-name-input', TestData.users.child.firstName);
    await dashboardPage.typeText('child-last-name-input', TestData.users.child.lastName);
    await dashboardPage.typeText('child-age-input', TestData.users.child.age.toString());
    await dashboardPage.typeText('child-pin-input', TestData.users.child.pin);
    await dashboardPage.typeText('child-pin-confirm-input', TestData.users.child.pin);
    await dashboardPage.tapElement('add-child-submit-button');
    
    // Attendre la confirmation
    await dashboardPage.expectTextVisible('Enfant ajouté avec succès');
  }

  async function removeAllChildren() {
    // Implémentation pour supprimer tous les enfants de test
    try {
      while (await dashboardPage.expectElementVisible('child-card-0')) {
        await dashboardPage.tapElement('child-card-0');
        await dashboardPage.tapElement('child-options-button');
        await dashboardPage.tapElement('delete-child-button');
        await dashboardPage.tapElement('confirm-delete-button');
        await pinValidationPage.enterPin(TestData.users.parent.pin || '1234');
        await navigationHelper.navigateToTab('children');
      }
    } catch (error) {
      // Tous les enfants ont été supprimés
    }
  }
});