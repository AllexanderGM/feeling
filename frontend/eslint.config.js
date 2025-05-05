import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import unicorn from 'eslint-plugin-unicorn'
import markdown from 'eslint-plugin-markdown'
import html from 'eslint-plugin-html'

export default [
  {
    ignores: ['dist', '**/*.min.js', '**/dist/', '**/vendor/', '/js/coverage/']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        $: 'readonly',
        jQuery: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    settings: {
      react: { version: '18.3' },
      'import/resolver': {
        alias: {
          map: [
            ['@components', './src/components'],
            ['@styles', './src/styles'],
            ['@utils', './src/utils'],
            ['@hooks', './src/hooks']
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      import: importPlugin,
      unicorn,
      markdown,
      html
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'capitalized-comments': 'off',
      'comma-dangle': ['error', 'never'],
      'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-unassigned-import': ['off'],
      'import/no-useless-path-segments': 'error',
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'],
            ['sibling', 'parent', 'index']
          ],
          'newlines-between': 'always'
        }
      ],
      indent: ['error', 2, { MemberExpression: 'off', SwitchCase: 1 }],
      'logical-assignment-operators': 'off',
      'max-params': ['warn', 5],

      'new-cap': ['error', { properties: false }],
      'no-console': 'off',
      'no-negated-condition': 'off',
      'object-curly-spacing': ['error', 'always'],
      'operator-linebreak': 'off',
      'prefer-object-has-own': 'off',
      'prefer-template': 'error',
      semi: ['error', 'never'],
      strict: 'error',
      'react/prop-types': 'off'
    }
  },
  {
    files: ['dist/**'],
    env: {
      browser: false,
      node: true
    },
    parserOptions: {
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    processor: 'markdown/markdown'
  },
  {
    files: ['**/*.md/*.js', '**/*.md/*.mjs'],
    extends: 'plugin:markdown/recommended-legacy',
    parserOptions: {
      sourceType: 'module'
    },
    rules: {
      'unicorn/prefer-node-protocol': 'off'
    }
  }
]
