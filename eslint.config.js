import { fileURLToPath } from 'node:url'

import { defineConfig } from 'eslint/config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const sources = [
  'packages/core/src/**/*.{ts,vue}',
  'packages/registry/src/**/*.{ts,vue}',
  'apps/docs/app/**/*.{ts,vue}',
  'scripts/*.ts',
]

const components = ['packages/core/src/**/*.vue', 'packages/registry/src/**/*.vue', 'apps/docs/app/**/*.vue']

const internalInCore = {
  'no-restricted-imports': [
    'error',
    { patterns: [{ group: ['reka-ui/internal'], message: 'Only @kappa-ui/core may import reka-ui/internal.' }] },
  ],
}

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

// a selector list, a selection source and CSS lengths: the only ui strings in variables that are not classes
const notClasses = ['interactive', 'pendingSource', 'rest', 'track']
const uiSelectors = [...getDefaultSelectors(), { kind: 'variable', name: `^(?!(?:${notClasses.join('|')})$).+$` }]

// Prettier prints a static class attribute on one line, so wrapping leaves attributes to it
const withoutAttributes = (selectors) => selectors.filter((selector) => selector.kind !== 'attribute')

const tailwind = (files, entryPoint, cwd, ignore, selectors) => ({
  files,
  plugins: { 'better-tailwindcss': betterTailwindcss },
  settings: {
    'better-tailwindcss': { entryPoint: fromRoot(entryPoint), cwd: fromRoot(cwd), ...(selectors && { selectors }) },
  },
  rules: {
    ...betterTailwindcss.configs['correctness-error'].rules,
    'better-tailwindcss/no-unknown-classes': ['error', { ignore }],
    'better-tailwindcss/enforce-consistent-line-wrapping': [
      'error',
      {
        printWidth: 120,
        preferSingleLine: true,
        strictness: 'loose',
        selectors: withoutAttributes(selectors ?? getDefaultSelectors()),
      },
    ],
  },
})

export default defineConfig([
  {
    files: sources,
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: components,
    extends: [vue.configs['flat/essential']],
    languageOptions: { parserOptions: { parser: tseslint.parser, sourceType: 'module' } },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['packages/registry/src/**/*.{ts,vue}'],
    rules: internalInCore,
  },
  tailwind(['packages/registry/src/**/*.{ts,vue}'], './packages/registry/test/setup.css', './packages/registry/', [
    '^kappa-',
  ]),
  tailwind(
    ['packages/registry/src/ui/**/*.{ts,vue}'],
    './packages/registry/test/setup.css',
    './packages/registry/',
    ['^kappa-'],
    uiSelectors,
  ),
  tailwind(['apps/docs/app/**/*.{ts,vue}'], './apps/docs/app/assets/css/globals.css', './apps/docs/', [
    '^kappa-',
    '^not-prose$',
  ]),
])
