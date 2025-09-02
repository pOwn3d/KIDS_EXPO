import { by, device, element, expect } from 'detox';

describe('Basic App Launch', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    await expect(element(by.text('Kids Points'))).toBeVisible();
  });

  it('should display the login screen initially', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should navigate to registration screen', async () => {
    const registerLink = element(by.id('register-link'));
    await expect(registerLink).toBeVisible();
    await registerLink.tap();
    
    await expect(element(by.id('register-screen'))).toBeVisible();
    await expect(element(by.id('first-name-input'))).toBeVisible();
    await expect(element(by.id('last-name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should validate input fields', async () => {
    // Test login validation
    await device.reloadReactNative();
    
    const loginButton = element(by.id('login-button'));
    await loginButton.tap();
    
    // Should show validation errors for empty fields
    await expect(element(by.text('Email is required'))).toBeVisible();
    await expect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should handle network connectivity', async () => {
    // Test offline behavior
    await device.setURLBlacklist(['http://localhost:3001']);
    
    const emailInput = element(by.id('email-input'));
    const passwordInput = element(by.id('password-input'));
    const loginButton = element(by.id('login-button'));
    
    await emailInput.typeText('test@example.com');
    await passwordInput.typeText('password123');
    await loginButton.tap();
    
    // Should show network error
    await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();
    
    // Reset network
    await device.setURLBlacklist([]);
  });
});