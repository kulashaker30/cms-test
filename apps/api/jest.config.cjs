/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
    clearMocks: true,
    verbose: true,
    testTimeout: 30000,
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }]
    }
};
