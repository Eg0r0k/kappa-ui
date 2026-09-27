import { fileURLToPath } from 'node:url'

import { defineConfig } from 'eslint/config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const sources = [
  'packages/core/src/**/*.{ts,vue}',
  'packages/registry/src/**/*.{ts,vue}',
  'apps/docs/app/**/*.{ts,vue}',
  'scripts/*.ts',
]

const components = ['packages/core/src/**/*.vue', 'packages/registry/src/**/*.vue', 'apps/docs/app/**/*.vue']

const facadeOnly = {
  'no-restricted-imports': [
    'error',
    {
      paths: [{ name: 'reka-ui', message: 'Import from @delta-ui/core instead.' }],
      patterns: [{ group: ['reka-ui/*'], message: 'Import from @delta-ui/core instead.' }],
    },
  ],
}

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

const tailwind = (files, entryPoint, cwd, ignore) => ({
  files,
  plugins: { 'better-tailwindcss': betterTailwindcss },
  settings: { 'better-tailwindcss': { entryPoint: fromRoot(entryPoint), cwd: fromRoot(cwd) } },
  rules: {
    ...betterTailwindcss.configs['correctness-error'].rules,
    'better-tailwindcss/no-unknown-classes': ['error', { ignore }],
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
    rules: facadeOnly,
  },
  tailwind(['packages/registry/src/**/*.{ts,vue}'], './packages/registry/test/setup.css', './packages/registry/', [
    '^delta-',
  ]),
  tailwind(['apps/docs/app/**/*.{ts,vue}'], './apps/docs/app/assets/css/globals.css', './apps/docs/', [
    '^delta-',
    '^not-prose$',
  ]),
])
