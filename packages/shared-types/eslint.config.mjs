// Per project rule M3.5 — every Nx package needs its own flat eslint config.
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
