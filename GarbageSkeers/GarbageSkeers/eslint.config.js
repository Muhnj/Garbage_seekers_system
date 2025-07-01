// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Stop auto-sorting of imports
      'sort-imports': 'off',
      'import/order': 'off',

      // Stop removal of unused imports
      'no-unused-vars': 'warn', // Instead of error/removal
      'unused-imports/no-unused-imports': 'off',
    },
  },
]);
