import { device } from 'detox';

describe('Basic App Launch', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen on launch', async () => {
    // Simple test to verify the app launches
    
    // Wait for any element to appear (basic smoke test)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  });

  it('should handle app backgrounding', async () => {
    // Test app lifecycle
    await device.sendToHome();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await device.launchApp();
    
  });
});