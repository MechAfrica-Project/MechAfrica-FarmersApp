// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // Enforce no native alert/confirm usage across the codebase — prefer our toast APIs
  {
    rules: {
      'no-restricted-globals': ['error', 'alert', 'confirm'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Alert'],
              message: "Use the toast helpers from '@/lib/toast' (e.g. toastConfirm) instead of Alert.alert",
            },
          ],
        },
      ],
    },
  },
]);
