import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/*.config.ts',
      '**/*.cjs',
      '**/*.json',
      '**/.eslintrc.js',
      '**/dist/',
      '**/node_modules/',
      '**/build/',
      '**/coverage/',
      '**/docs/',
      '**/migrations/',
      '**/seeds/',
      '**/scripts/',
      '**/test/',
      '**/tmp/',
      '**/temp/',
      '**/tools/',
      '**/webpack/',
      '**/prisma/',
      '**/public/',
      '**/tests/',
    ],
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir:
          '/home/node/wsl-code/webd/main-projects/sms-monitoring-system/apps/server',
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',

      'prettier/prettier': [
        'warn',
        {
          semi: true,
        },
      ],
    },
  },
];
