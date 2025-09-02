/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts', '<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    'detox/runners/jest/reporter',
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  preset: 'ts-jest',
  transform: {
    '\\.[jt]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};