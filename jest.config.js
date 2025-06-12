export default {
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: [ '.jsx'],
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
  };