module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/resources/js/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/js/$1',
    '^@components/(.*)$': '<rootDir>/resources/js/Components/$1',
    '^@pages/(.*)$': '<rootDir>/resources/js/Pages/$1',
    '^@layouts/(.*)$': '<rootDir>/resources/js/Layouts/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: [
    '<rootDir>/resources/js/**/__tests__/**/*.test.(ts|tsx)',
    '<rootDir>/resources/js/**/*.test.(ts|tsx)'
  ],
  collectCoverageFrom: [
    'resources/js/**/*.{ts,tsx}',
    '!resources/js/**/*.d.ts',
    '!resources/js/app.tsx',
    '!resources/js/bootstrap.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};