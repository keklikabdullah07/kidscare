import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    ignores: ['src/generated/**', 'prisma/migrations/**'],
  },
];
