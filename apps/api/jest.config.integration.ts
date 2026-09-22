import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.integration\\.spec\\.ts$|apps/api/test/.*\\.spec\\.ts$',
  moduleDirectories: ['node_modules', '../../node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/setup-integration-env.ts',
};

export default config;
