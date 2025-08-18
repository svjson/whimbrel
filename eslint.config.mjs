import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';
import nPlugin from 'eslint-plugin-n';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.ts'],
    ignores: [
      '**/dist/**',
      '*.config.ts'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptEslint.parser,
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      import: importPlugin,
      n: nPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...prettier.rules,
      ...importPlugin.configs.typescript.rules,
      ...nPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          ignores: ['modules'],
        },
      ],
      'no-useless-catch': 'warn',
      'no-unused-vars': 'off',
      'n/no-missing-import': 'off'
    },
  }
]);
