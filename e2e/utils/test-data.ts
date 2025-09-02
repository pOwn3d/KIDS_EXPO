// Données de test pour les E2E
export const TestData = {
  // Utilisateurs de test
  users: {
    parent: {
      email: 'parent.test@famille.com',
      password: 'parent123!',
      firstName: 'Parent',
      lastName: 'Test',
    },
    child: {
      firstName: 'Enfant',
      lastName: 'Test',
      age: 8,
      pin: '1234',
    },
    // Utilisateur pour les tests d'invitation
    invitedParent: {
      email: 'invite.test@famille.com',
      password: 'InviteTest123!',
      firstName: 'Invité',
      lastName: 'Test',
    },
  },

  // Missions de test
  missions: {
    simple: {
      title: 'Ranger sa chambre',
      description: 'Ranger et nettoyer sa chambre',
      pointsReward: 10,
      category: 'household',
      difficulty: 'easy',
    },
    complex: {
      title: 'Faire ses devoirs',
      description: 'Terminer tous les devoirs de la journée',
      pointsReward: 20,
      category: 'educational',
      difficulty: 'medium',
      isRecurring: true,
      recurringPattern: 'daily',
    },
  },

  // Récompenses de test
  rewards: {
    small: {
      title: '30min de jeu vidéo',
      description: 'Temps supplémentaire pour jouer',
      pointsCost: 25,
      category: 'digital',
    },
    big: {
      title: 'Sortie cinéma',
      description: 'Aller voir un film au cinéma',
      pointsCost: 100,
      category: 'outing',
    },
  },

  // Punitions de test
  punishments: {
    light: {
      title: 'Pas de tablette',
      description: 'Interdiction d\'utiliser la tablette',
      category: 'digital',
      difficulty: 'easy',
      defaultDuration: 2, // heures
    },
    strict: {
      title: 'Coucher plus tôt',
      description: 'Aller au lit 1 heure plus tôt',
      category: 'general',
      difficulty: 'medium',
      defaultDuration: 24, // heures
    },
  },

  // Données pour les formulaires
  forms: {
    invalidEmail: 'email-invalide',
    shortPassword: '123',
    validPin: '1234',
    invalidPin: '0000',
  },

  // Identifiants de test pour les éléments UI
  testIDs: {
    // Authentification
    auth: {
      emailInput: 'auth-email-input',
      passwordInput: 'auth-password-input',
      loginButton: 'auth-login-button',
      registerButton: 'auth-register-button',
      forgotPasswordLink: 'auth-forgot-password-link',
    },

    // Navigation
    navigation: {
      dashboardTab: 'tab-dashboard',
      missionsTab: 'tab-missions',
      rewardsTab: 'tab-rewards',
      profileTab: 'tab-profile',
    },

    // Dashboard
    dashboard: {
      parentDashboard: 'parent-dashboard',
      childDashboard: 'child-dashboard',
      addChildButton: 'add-child-button',
      quickActions: 'quick-actions-grid',
    },

    // Missions
    missions: {
      missionsList: 'missions-list',
      createMissionButton: 'create-mission-button',
      missionCard: 'mission-card',
      completeMissionButton: 'complete-mission-button',
    },

    // Récompenses
    rewards: {
      rewardsList: 'rewards-list',
      createRewardButton: 'create-reward-button',
      rewardCard: 'reward-card',
      claimRewardButton: 'claim-reward-button',
    },

    // Punitions
    punishments: {
      punishmentsList: 'punishments-list',
      createPunishmentButton: 'create-punishment-button',
      punishmentCard: 'punishment-card',
      applyPunishmentButton: 'apply-punishment-button',
    },

    // Modals et dialogs
    modals: {
      pinModal: 'pin-validation-modal',
      pinInput: 'pin-input',
      confirmButton: 'modal-confirm-button',
      cancelButton: 'modal-cancel-button',
    },

    // Formulaires
    forms: {
      titleInput: 'form-title-input',
      descriptionInput: 'form-description-input',
      pointsInput: 'form-points-input',
      submitButton: 'form-submit-button',
    },
  },
};

// Messages d'erreur attendus
export const TestMessages = {
  validation: {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer un email valide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordsMismatch: 'Les mots de passe ne correspondent pas',
  },

  success: {
    loginSuccess: 'Connexion réussie',
    registrationSuccess: 'Compte créé avec succès',
    missionCompleted: 'Mission terminée',
    rewardClaimed: 'Récompense réclamée',
  },

  errors: {
    networkError: 'Erreur de réseau',
    unauthorized: 'Non autorisé',
    notFound: 'Non trouvé',
  },
};

// Configuration des delays pour les tests
export const TestTimings = {
  short: 1000,      // 1 seconde
  medium: 3000,     // 3 secondes
  long: 10000,      // 10 secondes
  veryLong: 30000,  // 30 secondes
};

export default TestData;
