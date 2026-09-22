const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testRegex: '.*\\.integration\\.spec\\.ts$|apps/api/test/.*\\.spec\\.ts$',
    moduleDirectories: ['node_modules', '../../node_modules'],
    testTimeout: 30000,
    globalSetup: '<rootDir>/test/setup-integration-env.ts',
};
export default config;
