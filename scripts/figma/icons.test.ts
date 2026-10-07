import assert from 'node:assert/strict'
import { test } from 'node:test'

import { iconFilesOf, lucideImportsOf, lucideIndexOf, svgOf } from './icons.ts'

test('maps every export alias of the lucide index to its icon file', () => {
  const index =
    lucideIndexOf(`export { default as ChevronDown, default as ChevronDownIcon, default as LucideChevronDown } from './icons/chevron-down.mjs';
export { default as Ellipsis, default as MoreHorizontal } from './icons/ellipsis.mjs';
export { default as createLucideIcon } from './createLucideIcon.mjs';
`)
  assert.equal(index.get('ChevronDownIcon'), 'chevron-down')
  assert.equal(index.get('MoreHorizontal'), 'ellipsis')
  assert.equal(index.has('createLucideIcon'), false)
})

test('collects value imports from @lucide/vue across single- and multi-line statements', () => {
  const source = `import { Check, X as Close } from "@lucide/vue";
import {
  ChevronDown,
  MoreHorizontal,
} from '@lucide/vue'
import type { LucideIcon } from "@lucide/vue";
import { Primitive } from "reka-ui";
`
  assert.deepEqual(lucideImportsOf(source), ['Check', 'X', 'ChevronDown', 'MoreHorizontal'])
})

test('dedupes aliases of one icon, adds extra names and sorts', () => {
  const index = new Map([
    ['Ellipsis', 'ellipsis'],
    ['MoreHorizontal', 'ellipsis'],
    ['Check', 'check'],
    ['Heart', 'heart'],
  ])
  const sources = ['import { MoreHorizontal, Ellipsis, Check } from "@lucide/vue"']
  assert.deepEqual(iconFilesOf(sources, index, ['heart']), ['check', 'ellipsis', 'heart'])
})

test('rejects unknown exports and unknown extra names', () => {
  const index = new Map([['Check', 'check']])
  assert.throws(
    () => iconFilesOf(['import { Nope } from "@lucide/vue"'], index, []),
    /Unknown @lucide\/vue export: Nope/,
  )
  assert.throws(() => iconFilesOf([], index, ['nope']), /Unknown lucide icon: nope/)
})

test('builds a lucide svg without the vnode keys', () => {
  const svg = svgOf([
    ['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }],
    ['circle', { cx: 12, cy: 12, r: 10, key: 'x' }],
  ])
  assert.equal(
    svg,
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/><circle cx="12" cy="12" r="10"/></svg>',
  )
})
