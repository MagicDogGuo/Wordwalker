const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-n');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Style/best-practice rules aligned with nodebestpractices.mdc
      eqeqeq: ['error', 'always'], // 3.10 use the === operator
      'no-var': 'error', // 3.7 prefer const/let over var
      'prefer-const': 'error',
      'no-console': 'off', // console usage is routed through utils/logger.js by convention
      'n/no-process-env': 'error', // 1.4 only backend/config/index.js may read process.env directly
      'n/no-missing-require': 'off', // handled by module resolution already
      // This backend is never published to npm, so the "is it a listed
      // dependency" heuristic behind this rule doesn't apply here.
      'n/no-unpublished-require': 'off',
      // Exiting on an unrecoverable startup failure (e.g. cannot connect to
      // MongoDB) is an intentional fail-fast pattern (see server.js).
      'n/no-process-exit': 'off',
    },
  },
  {
    // The config module is the ONE place allowed to read process.env directly.
    files: ['config/**/*.js'],
    rules: {
      'n/no-process-env': 'off',
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
