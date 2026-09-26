import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'build-registry.ts')

const component = {
  name: 'demo',
  type: 'registry:ui',
  title: 'Demo',
  description: 'A demo component.',
  files: [{ path: 'src/ui/demo/Demo.vue', type: 'registry:ui' }],
}

const example = {
  name: 'demo-example',
  type: 'registry:block',
  title: 'Demo example',
  description: 'Shows the demo component.',
  categories: ['example'],
  registryDependencies: ['demo'],
  files: [{ path: 'src/examples/demo/DemoExample.vue', type: 'registry:component' }],
}

const run = async (items: unknown[], env: Record<string, string> = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'delta-registry-'))
  await mkdir(join(root, 'src/ui/demo'), { recursive: true })
  await mkdir(join(root, 'src/examples/demo'), { recursive: true })
  await mkdir(join(root, 'src/other'), { recursive: true })
  await writeFile(join(root, 'src/ui/demo/Demo.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/examples/demo/DemoExample.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/other/Stray.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/other/fade.css'), '.fade {}\n')
  await writeFile(join(root, 'registry.json'), JSON.stringify({ name: 'fixture', items }))
  const out = join(root, 'out')
  const result = spawnSync(
    process.execPath,
    [script, '--manifest', join(root, 'registry.json'), '--out', out],
    { encoding: 'utf8', env: { ...process.env, ...env } },
  )
  return { status: result.status, stderr: result.stderr, out }
}

test('accepts an example that depends on the component it shows', async () => {
  const { status, stderr } = await run([component, example])
  assert.equal(status, 0, stderr)
})

test('accepts a theme with no files', async () => {
  const theme = {
    name: 'theme',
    type: 'registry:theme',
    title: 'Theme',
    description: 'A theme.',
    cssVars: { light: { primary: 'blue' } },
    files: [],
  }
  const { status, stderr } = await run([component, example, theme])
  assert.equal(status, 0, stderr)
})

test('rejects an example without registryDependencies', async () => {
  const { status, stderr } = await run([component, { ...example, registryDependencies: [] }])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo-example": an example must list the item it demonstrates in registryDependencies/)
})

test('rejects an example that is not a registry:block', async () => {
  const { status, stderr } = await run([component, { ...example, type: 'registry:component' }])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo-example": an example must be of type registry:block/)
})

test('rejects an example file outside src/examples', async () => {
  const { status, stderr } = await run([
    component,
    { ...example, files: [{ path: 'src/other/Stray.vue', type: 'registry:component' }] },
  ])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo-example", file "src\/other\/Stray.vue": example files must live under src\/examples\//)
})

test('builds dependency URLs and the homepage from DELTA_UI_URL', async () => {
  const { status, stderr, out } = await run([component, example], { DELTA_UI_URL: 'https://example.test/' })
  assert.equal(status, 0, stderr)
  const item = JSON.parse(await readFile(join(out, 'demo-example.json'), 'utf8'))
  assert.deepEqual(item.registryDependencies, ['https://example.test/r/demo.json'])
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8'))
  assert.equal(index.homepage, 'https://example.test')
})

test('accepts an item that ships a css file', async () => {
  const style = {
    name: 'fade',
    type: 'registry:item',
    title: 'Fade',
    description: 'A css utility.',
    files: [{ path: 'src/other/fade.css', type: 'registry:file', target: 'styles/fade.css' }],
  }
  const { status, stderr } = await run([component, example, style])
  assert.equal(status, 0, stderr)
})

test('rejects an item that ships a utility or keyframes in its css', async () => {
  const styled = {
    ...component,
    css: { '@layer base': { html: { color: 'red' } }, '@utility glow': { 'box-shadow': '0 0 4px red' } },
  }
  const { status, stderr } = await run([styled, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": @utility and @keyframes belong in @delta-ui\/core\/tailwind.css/)
})

test('accepts an item that imports the core stylesheet', async () => {
  const styled = { ...component, css: { '@import "@delta-ui/core/tailwind.css"': {} } }
  const { status, stderr } = await run([styled, example])
  assert.equal(status, 0, stderr)
})
