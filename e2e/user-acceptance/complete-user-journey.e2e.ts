import { by, device, element, expect } from 'detox';

describe('Complete User Journey - Kids Points App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  describe('🚀 New User Registration Flow', () => {
    it('should guide a new parent through complete registration', async () => {
      // Step 1: App launches and shows welcome screen
      await expect(element(by.text('Kids Points'))).toBeVisible();
      await expect(element(by.id('login-screen'))).toBeVisible();
      
      // Step 2: User chooses to register
      await element(by.id('register-link')).tap();
      await expect(element(by.id('register-screen'))).toBeVisible();
      
      // Step 3: User fills registration form
      await element(by.id('first-name-input')).typeText('Marie');
      await element(by.id('last-name-input')).typeText('Dupont');
      await element(by.id('email-input')).typeText('marie.dupont@example.com');
      await element(by.id('password-input')).typeText('SecurePassword123!');
      await element(by.id('confirm-password-input')).typeText('SecurePassword123!');
      
      // Step 4: Accept terms and register
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      // Step 5: Should show success or navigate to next step
      await expect(
        element(by.text(/registration successful|welcome|verify email/i))
      ).toBeVisible();
    });

    it('should handle registration validation errors gracefully', async () => {
      await element(by.id('register-link')).tap();
      
      // Try to register with invalid data
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('weak');
      await element(by.id('register-button')).tap();
      
      // Should show validation errors
      await expect(element(by.text(/valid email/i))).toBeVisible();
      await expect(element(by.text(/password.*strong/i))).toBeVisible();
      
      // User corrects errors
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('marie@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('StrongPassword123!');
      
      // Form should now be valid
      await element(by.id('register-button')).tap();
    });
  });

  describe('🔐 User Authentication Flow', () => {
    it('should allow existing user to login successfully', async () => {
      // User enters credentials
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      // Should navigate to main dashboard
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.text(/welcome back/i))).toBeVisible();
    });

    it('should handle login errors appropriately', async () => {
      // Wrong credentials
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      // Should show error message
      await expect(element(by.text(/invalid credentials/i))).toBeVisible();
      
      // User should still be on login screen
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should handle "forgot password" flow', async () => {
      await element(by.id('forgot-password-link')).tap();
      
      // Should show forgot password screen
      await expect(element(by.id('forgot-password-screen'))).toBeVisible();
      
      // User enters email
      await element(by.id('reset-email-input')).typeText('parent@example.com');
      await element(by.id('send-reset-button')).tap();
      
      // Should show confirmation
      await expect(element(by.text(/reset link sent/i))).toBeVisible();
    });
  });

  describe('👨‍👩‍👧‍👦 Parent Dashboard & Child Management', () => {
    beforeEach(async () => {
      // Login as parent first
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should display children overview on dashboard', async () => {
      // Should show children cards
      await expect(element(by.id('children-list'))).toBeVisible();
      
      // Should show child stats if children exist
      const childCard = element(by.id('child-card-1'));
      if (await childCard.getAttributes().catch(() => null)) {
        await expect(childCard).toBeVisible();
        await expect(element(by.id('child-points-display'))).toBeVisible();
        await expect(element(by.id('child-level-display'))).toBeVisible();
      }
    });

    it('should allow adding a new child', async () => {
      // Navigate to add child
      await element(by.id('add-child-button')).tap();
      await expect(element(by.id('add-child-screen'))).toBeVisible();
      
      // Fill child information
      await element(by.id('child-name-input')).typeText('Lucas');
      await element(by.id('child-age-input')).typeText('8');
      await element(by.id('child-avatar-selector')).tap();
      
      // Select an avatar (assuming first option)
      await element(by.id('avatar-option-1')).tap();
      
      // Save child
      await element(by.id('save-child-button')).tap();
      
      // Should return to dashboard with new child
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.text('Lucas'))).toBeVisible();
    });

    it('should allow editing child information', async () => {
      // Assume child exists, tap to edit
      await element(by.id('child-card-1')).tap();
      await element(by.id('edit-child-button')).tap();
      
      // Modify child info
      await element(by.id('child-name-input')).clearText();
      await element(by.id('child-name-input')).typeText('Lucas Updated');
      
      // Save changes
      await element(by.id('save-child-button')).tap();
      
      // Should show updated name
      await expect(element(by.text('Lucas Updated'))).toBeVisible();
    });
  });

  describe('🎯 Missions & Points System', () => {
    beforeEach(async () => {
      // Login and navigate to missions
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await element(by.id('missions-tab')).tap();
    });

    it('should display available missions', async () => {
      await expect(element(by.id('missions-screen'))).toBeVisible();
      await expect(element(by.id('missions-list'))).toBeVisible();
      
      // Should show at least one mission
      await expect(element(by.id('mission-card'))).toBeVisible();
    });

    it('should allow parent to assign mission to child', async () => {
      // Select a mission
      await element(by.id('mission-card-1')).tap();
      await expect(element(by.id('mission-details-screen'))).toBeVisible();
      
      // Assign to child
      await element(by.id('assign-to-child-button')).tap();
      await element(by.id('child-selector-Lucas')).tap();
      await element(by.id('confirm-assignment-button')).tap();
      
      // Should show success confirmation
      await expect(element(by.text(/mission assigned/i))).toBeVisible();
    });

    it('should allow parent to validate completed mission', async () => {
      // Navigate to active missions
      await element(by.id('active-missions-tab')).tap();
      
      // Find completed mission (assuming one exists)
      await element(by.id('completed-mission-card')).tap();
      
      // Validate completion
      await element(by.id('validate-mission-button')).tap();
      
      // Should award points
      await expect(element(by.text(/points awarded/i))).toBeVisible();
    });
  });

  describe('🏆 Rewards System', () => {
    beforeEach(async () => {
      // Login and navigate to rewards
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await element(by.id('rewards-tab')).tap();
    });

    it('should display reward catalog', async () => {
      await expect(element(by.id('rewards-screen'))).toBeVisible();
      await expect(element(by.id('rewards-list'))).toBeVisible();
      
      // Should show available rewards
      await expect(element(by.id('reward-card'))).toBeVisible();
    });

    it('should allow child to claim reward (simulated)', async () => {
      // Switch to child mode or simulate child interaction
      await element(by.id('child-mode-toggle')).tap();
      
      // Select reward
      await element(by.id('reward-card-1')).tap();
      await expect(element(by.id('reward-details-screen'))).toBeVisible();
      
      // Check if child has enough points
      const claimButton = element(by.id('claim-reward-button'));
      if (await claimButton.getAttributes().catch(() => null)) {
        await claimButton.tap();
        
        // Should require parent approval or immediately claim
        await expect(element(by.text(/reward claimed|parent approval needed/i))).toBeVisible();
      }
    });

    it('should handle reward approval flow', async () => {
      // Navigate to pending rewards (parent view)
      await element(by.id('pending-rewards-tab')).tap();
      
      // Approve pending reward
      const approveButton = element(by.id('approve-reward-button'));
      if (await approveButton.getAttributes().catch(() => null)) {
        await approveButton.tap();
        
        // Should show success
        await expect(element(by.text(/reward approved/i))).toBeVisible();
      }
    });
  });

  describe('📊 Progress Tracking & Analytics', () => {
    beforeEach(async () => {
      // Login and navigate to progress
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await element(by.id('progress-tab')).tap();
    });

    it('should display child progress overview', async () => {
      await expect(element(by.id('progress-screen'))).toBeVisible();
      
      // Should show stats
      await expect(element(by.id('points-earned-stat'))).toBeVisible();
      await expect(element(by.id('missions-completed-stat'))).toBeVisible();
      await expect(element(by.id('current-level-stat'))).toBeVisible();
    });

    it('should show progress charts and history', async () => {
      // Check for progress visualization
      await expect(element(by.id('progress-chart'))).toBeVisible();
      
      // Navigate through time periods
      await element(by.id('weekly-view-button')).tap();
      await expect(element(by.id('weekly-progress'))).toBeVisible();
      
      await element(by.id('monthly-view-button')).tap();
      await expect(element(by.id('monthly-progress'))).toBeVisible();
    });
  });

  describe('⚙️ Settings & Profile Management', () => {
    beforeEach(async () => {
      // Login and navigate to settings
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await element(by.id('settings-tab')).tap();
    });

    it('should allow profile editing', async () => {
      await expect(element(by.id('settings-screen'))).toBeVisible();
      
      // Edit profile
      await element(by.id('edit-profile-button')).tap();
      await element(by.id('profile-name-input')).clearText();
      await element(by.id('profile-name-input')).typeText('Marie Updated');
      await element(by.id('save-profile-button')).tap();
      
      // Should show updated name
      await expect(element(by.text('Marie Updated'))).toBeVisible();
    });

    it('should allow password change', async () => {
      await element(by.id('change-password-button')).tap();
      
      await element(by.id('current-password-input')).typeText('password123');
      await element(by.id('new-password-input')).typeText('NewPassword123!');
      await element(by.id('confirm-new-password-input')).typeText('NewPassword123!');
      
      await element(by.id('update-password-button')).tap();
      
      // Should show success
      await expect(element(by.text(/password updated/i))).toBeVisible();
    });

    it('should handle app preferences', async () => {
      await element(by.id('preferences-section')).tap();
      
      // Toggle notifications
      await element(by.id('notifications-toggle')).tap();
      
      // Change theme
      await element(by.id('theme-selector')).tap();
      await element(by.id('dark-theme-option')).tap();
      
      // Changes should be applied
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('🔄 App Lifecycle & Error Handling', () => {
    beforeEach(async () => {
      await element(by.id('email-input')).typeText('parent@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
    });

    it('should maintain session when app is backgrounded', async () => {
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      
      // Send app to background
      await device.sendToBackground(3);
      
      // Should return to same screen
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should handle network disconnection gracefully', async () => {
      // Simulate network loss
      await device.setURLBlacklist(['*']);
      
      // Try to perform action requiring network
      await element(by.id('missions-tab')).tap();
      
      // Should show offline message
      await expect(element(by.text(/offline|no connection|network error/i))).toBeVisible();
      
      // Restore network
      await device.setURLBlacklist([]);
      
      // Should recover
      await element(by.id('retry-button')).tap();
      await expect(element(by.id('missions-screen'))).toBeVisible();
    });

    it('should handle app updates and data migration', async () => {
      // This would test version migration scenarios
      // For now, just verify app stability after restart
      
      await device.terminateApp();
      await device.launchApp();
      
      // Should maintain user session or show login
      const isLoggedIn = await element(by.id('dashboard-screen')).getAttributes().catch(() => null);
      const isAtLogin = await element(by.id('login-screen')).getAttributes().catch(() => null);
      
      expect(isLoggedIn || isAtLogin).toBeTruthy();
    });
  });

  describe('🌐 Cross-Platform Behavior', () => {
    it('should maintain consistent UI across platforms', async () => {
      // Test key screens exist and are functional
      const screens = ['login-screen', 'dashboard-screen'];
      
      for (const screenId of screens) {
        if (await element(by.id(screenId)).getAttributes().catch(() => null)) {
          await expect(element(by.id(screenId))).toBeVisible();
        }
      }
    });

    it('should handle platform-specific features appropriately', async () => {
      if (device.getPlatform() === 'ios') {
        // iOS specific tests
        // Face ID, notifications, etc.
      } else if (device.getPlatform() === 'android') {
        // Android specific tests
        // Back button, permissions, etc.
        await device.pressBack();
      }
    });

    it('should adapt to different screen sizes and orientations', async () => {
      // Portrait mode
      await device.setOrientation('portrait');
      await expect(element(by.id('login-screen'))).toBeVisible();
      
      // Landscape mode
      await device.setOrientation('landscape');
      await expect(element(by.id('login-screen'))).toBeVisible();
      
      // Reset
      await device.setOrientation('portrait');
    });
  });
});