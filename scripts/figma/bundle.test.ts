import assert from 'node:assert/strict'
import { test } from 'node:test'

import { bundleOf } from './bundle.ts'

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (body: string) => () => Promise<unknown>

test('strips types, drops relative imports and export keywords, and calls the entry with the payload', async () => {
  const bundle = bundleOf(
    [
      { file: 'shared.ts', source: 'export const twice = (value: number): number => value * 2\n' },
      {
        file: 'main.ts',
        source: [
          "import type { SyncReport } from '../payload.ts'",
          "import { twice } from './shared.ts'",
          '',
          'export type Input = { value: number }',
          'export const main = async (payload: Input) => twice(payload.value)',
          '',
        ].join('\n'),
      },
    ],
    'main',
    { value: 21 },
  )
  assert.equal(await new AsyncFunction(bundle)(), 42)
})

test('drops multi-line imports and imports that climb out of the folder', () => {
  const source = [
    'import {',
    '  twice,',
    '  thrice,',
    "} from '../../../scripts/figma/runtime/shared.ts'",
    'export const build = () => 1',
    '',
  ].join('\n')
  const bundle = bundleOf([{ file: 'button.ts', source }], 'build', {})
  assert.doesNotMatch(bundle, /import|twice/)
})

test('rejects imports and exports it cannot bundle', () => {
  assert.throws(
    () => bundleOf([{ file: 'a.ts', source: "import { x } from 'reka-ui'\n" }], 'a', {}),
    /a\.ts: unsupported import/,
  )
  assert.throws(() => bundleOf([{ file: 'a.ts', source: 'export default 1\n' }], 'a', {}), /a\.ts: unsupported export/)
})
