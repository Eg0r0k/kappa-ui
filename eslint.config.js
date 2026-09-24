import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const facadeOnly = {
  'no-restricted-imports': [
    'error',
    {
      paths: [{ name: 'reka-ui', message: 'Import from @delta-ui/core instead.' }],
      patterns: [{ group: ['reka-ui/*'], message: 'Import from @delta-ui/core instead.' }],
    },
  ],
}

export default [
  {
    files: ['packages/registry/src/**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: facadeOnly,
  },
  {
    files: ['packages/registry/src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsParser, sourceType: 'module' },
    },
    rules: facadeOnly,
  },
]
