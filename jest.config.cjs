module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts']
  ,
  moduleNameMapper: {
    '^@\/(.*)$': '<rootDir>/$1',
    '^react-native-toast-notifications$': '<rootDir>/tests/__mocks__/react-native-toast-notifications.js'
  }
};

