import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'think-tank-output']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Complexity checks
      'complexity': ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', { max: 5 }],
      'max-nested-callbacks': ['warn', { max: 3 }],

      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'warn',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },
  {
    // Relax rules for CLI and test files
    files: ['cli/**/*.ts', 'src/test/**/*.ts'],
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off',
      'complexity': ['warn', { max: 20 }],
    },
  },
])
