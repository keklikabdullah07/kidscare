const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    testPathIgnorePatterns: ['/node_modules/', '/apps/api/test/'],
    moduleDirectories: ['node_modules', '../../node_modules'],
};
export default config;
