// Jest config 
export default {
  testEnvironment: 'node',// run tests in node environment
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'], // find out the test folder or files 
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  maxWorkers: 1, // Run tests serially to avoid database conflicts ... upon increasing this the test cases fail due to multiple connections which causes deadlocks 
};
