import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import postcss, { AtRule, Rule, type Node } from 'postcss'

type CssRules = { [key: string]: string | CssRules }
type CssVars = { light?: Record<string, string>; dark?: Record<string, string>; theme?: Record<string, string> }
type Item = { name: string; categories?: string[]; css?: CssRules; cssVars?: CssVars }
type Declared = Map<string, { value: string; source: string }>

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')

const clean = (text: string) => text.replace(/'/g, '"').replace(/\s+/g, ' ').trim()

const serializeRules = (rules: CssRules): string =>
  Object.entries(rules)
    .map(([key, body]) => {
      if (typeof body === 'string') return `${key}: ${body};`
      if (Object.keys(body).length === 0) return `${key};`
      return `${key} { ${serializeRules(body)} }`
    })
    .join(' ')

const serializeVars = (vars: CssVars) =>
  (
    [
      [':root', vars.light],
      ['.dark', vars.dark],
      ['@theme inline', vars.theme],
    ] as const
  )
    .flatMap(([selector, group]) =>
      group && Object.keys(group).length > 0
        ? [`${selector} { ${Object.entries(group).map(([name, value]) => `--${name}: ${value};`).join(' ')} }`]
        : [],
    )
    .join(' ')

const selectorOf = (selector: string) =>
  selector
    .split(',')
    .map(clean)
    .filter((part) => part !== '.light')
    .join(', ')

const contextOf = (node: Node) => {
  const chain: string[] = []
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent instanceof Rule) chain.unshift(selectorOf(parent.selector))
    if (parent instanceof AtRule) chain.unshift(parent.name === 'theme' ? '@theme' : `@${parent.name} ${clean(parent.params)}`)
  }
  return chain.join(' > ')
}

const declarations = (css: string, source: string, into: Declared = new Map()) => {
  postcss.parse(css).walkDecls((decl) => {
    into.set(`${contextOf(decl)} :: ${decl.prop}`, { value: clean(decl.value), source })
  })
  return into
}

const importsOf = (css: string) => {
  const found: string[] = []
  postcss.parse(css).walkAtRules('import', (rule) => {
    found.push(clean(rule.params))
  })
  return found
}

const items = (JSON.parse(read('packages/registry/registry.json')) as { items: Item[] }).items.filter(
  (item) => !item.categories?.includes('example'),
)

const manifest: Declared = new Map()
const manifestImports: string[] = []
for (const item of items) {
  const css = [item.cssVars ? serializeVars(item.cssVars) : '', item.css ? serializeRules(item.css) : ''].join(' ')
  declarations(css, item.name, manifest)
  manifestImports.push(...importsOf(css))
}

const mismatches = (mirror: Declared, keys: Iterable<string>) =>
  [...keys].flatMap((key) => {
    const expected = manifest.get(key)
    const actual = mirror.get(key)?.value
    return expected === undefined || actual === expected.value
      ? []
      : [`${expected.source}: ${key} — manifest ${expected.value}, mirror ${actual ?? 'missing'}`]
  })

test('the docs stylesheet declares every token and rule the manifest ships, with the same value', () => {
  const site = declarations(read('apps/docs/app/assets/css/globals.css'), 'globals.css')
  assert.deepEqual(mismatches(site, manifest.keys()), [])
})

test('the docs stylesheet imports what the manifest imports', () => {
  const site = importsOf(read('apps/docs/app/assets/css/globals.css'))
  assert.deepEqual(
    manifestImports.filter((entry) => !site.includes(entry)),
    [],
  )
})

test('the registry test stylesheet agrees with the manifest wherever both declare something', () => {
  const tests = declarations(read('packages/registry/test/setup.css'), 'setup.css')
  assert.deepEqual(mismatches(tests, tests.keys()), [])
})
