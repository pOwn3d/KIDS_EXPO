# Testing Guide

## Overview
This project uses a comprehensive testing strategy with both unit tests and End-to-End (E2E) tests to ensure reliability and quality.

## Testing Stack
- **Unit Tests**: Jest with React Native Testing Library
- **E2E Tests**: Detox for iOS and Android
- **CI/CD**: GitHub Actions for automated testing

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### E2E Tests
```bash
# Install E2E dependencies (first time only)
npm run build:e2e:ios    # iOS
npm run build:e2e:android  # Android

# Run E2E tests
npm run test:e2e:ios     # iOS Simulator
npm run test:e2e:android # Android Emulator
```

## Test Structure

### Unit Tests
Located in `__tests__/` directories alongside components:
- **Components**: UI component behavior
- **Services**: Business logic and API calls
- **Utilities**: Helper functions and pure functions
- **Hooks**: Custom React hooks

### E2E Tests
Located in `e2e/` directory:
```
e2e/
├── auth/                 # Authentication flows
├── children/             # Child management
├── missions/             # Mission system
├── rewards/              # Rewards and claims
├── punishments/          # Punishment system
└── utils/               # Test utilities and page objects
```

## Test Data
Test data is centralized in `e2e/utils/test-data.ts`:
- User credentials (parent/child)
- Mission templates
- Reward definitions
- Test IDs for UI elements

## Page Object Pattern
E2E tests use the Page Object pattern for maintainability:
```typescript
// Example usage
await loginPage.login(TestData.users.parent.email, TestData.users.parent.password);
await dashboardPage.expectParentDashboardVisible();
```

## CI/CD Integration

### Automated Testing
Tests run automatically on:
- Pull requests to `main` and `develop`
- Pushes to `main` and `develop`
- Manual workflow dispatch

### Test Workflows
1. **Unit Tests**: Run on Ubuntu with coverage reporting
2. **E2E Tests**: Run on macOS (iOS) and Ubuntu (Android) with emulators
3. **Quality Gate**: Ensures all tests pass before merge

### Test Artifacts
When tests fail, artifacts are uploaded:
- Screenshots and videos
- Test logs
- Device logs and crash reports

## Writing Tests

### Unit Test Example
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { LoginButton } from '../LoginButton';

describe('LoginButton', () => {
  it('should handle login press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);
    
    fireEvent.press(getByText('Se connecter'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### E2E Test Example
```typescript
describe('Login Flow', () => {
  it('should login successfully as parent', async () => {
    await welcomePage.tapLogin();
    await loginPage.login(TestData.users.parent.email, TestData.users.parent.password);
    await dashboardPage.expectParentDashboardVisible();
  });
});
```

## Test Coverage Goals
- **Unit Tests**: >80% code coverage
- **E2E Tests**: Cover all critical user flows
- **Integration**: Test API interactions and state management

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
npm test -- --testNamePattern="LoginButton"

# Run tests with verbose output
npm test -- --verbose
```

### E2E Tests
```bash
# Run with debug logs
npm run test:e2e:ios -- --loglevel trace

# Take manual screenshots
await device.takeScreenshot('debug-screenshot');
```

## Best Practices

### Unit Tests
1. Test behavior, not implementation
2. Use descriptive test names
3. Mock external dependencies
4. Test edge cases and error states

### E2E Tests
1. Use Page Object pattern for reusability
2. Wait for elements instead of using timeouts
3. Clean up test data between tests
4. Test real user workflows

### Test Data
1. Use realistic test data
2. Avoid hardcoded values in tests
3. Clean up created data
4. Use factories for complex objects

## Troubleshooting

### Common Issues
1. **Simulator not starting**: Check Xcode and simulator setup
2. **Android emulator issues**: Verify AVD configuration
3. **Flaky tests**: Add proper waits and stability checks
4. **Test timeouts**: Increase timeout for slow operations

### Environment Setup
- **iOS**: Requires Xcode and iOS Simulator
- **Android**: Requires Android SDK and AVD
- **Node.js**: Version 18+ recommended
- **React Native**: Follow expo development build setup

## Performance Testing
- Monitor test execution time
- Optimize slow tests
- Use parallel execution when possible
- Profile memory usage in E2E tests