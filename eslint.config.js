const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      // Tooling uses CommonJS + require(); typescript-eslint "recommended" applies to all files otherwise.
      'babel.config.js',
      'metro.config.js',
      'react-native.config.js',
      'eslint.config.js',
      'jest.setup.js',
      'scripts/**',
    ],
  },
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      // `recommended` flat config in react-hooks@7+ enables compiler rules that flag common RN patterns.
      'react-hooks/exhaustive-deps': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        __DEV__: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
