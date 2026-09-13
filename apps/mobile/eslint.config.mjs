// Per project rule M3.5 — every Nx package needs its own flat eslint config.
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'ios/**', 'android/**'],
  },
];
