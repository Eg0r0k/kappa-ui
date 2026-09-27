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

const run = async (items: unknown[], env: Record<string, string> = {}, files: Record<string, string> = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'delta-registry-'))
  await mkdir(join(root, 'src/ui/demo'), { recursive: true })
  await mkdir(join(root, 'src/examples/demo'), { recursive: true })
  await mkdir(join(root, 'src/other'), { recursive: true })
  await writeFile(join(root, 'src/ui/demo/Demo.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/examples/demo/DemoExample.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/other/Stray.vue'), '<template><div /></template>\n')
  await writeFile(join(root, 'src/other/fade.css'), '.fade {}\n')
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), content)
  }
  await writeFile(join(root, 'registry.json'), JSON.stringify({ name: 'fixture', items }))
  await writeFile(join(root, 'core.json'), JSON.stringify({ name: '@delta-ui/core', version: '1.2.3' }))
  const out = join(root, 'out')
  const result = spawnSync(
    process.execPath,
    [script, '--manifest', join(root, 'registry.json'), '--out', out, '--core', join(root, 'core.json')],
    {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    },
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
  assert.match(
    stderr,
    /item "demo-example", file "src\/other\/Stray.vue": example files must live under src\/examples\//,
  )
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

test('rejects an item that ships a utility in a css file', async () => {
  const style = {
    name: 'glow',
    type: 'registry:item',
    title: 'Glow',
    description: 'A css utility file.',
    files: [{ path: 'src/other/glow.css', type: 'registry:file', target: 'styles/glow.css' }],
  }
  const { status, stderr } = await run(
    [component, example, style],
    {},
    {
      'src/other/glow.css': '@utility glow { color: red; }\n',
    },
  )
  assert.equal(status, 1)
  assert.match(
    stderr,
    /item "glow", file "src\/other\/glow\.css": @utility and @keyframes belong in @delta-ui\/core\/tailwind\.css/,
  )
})

test('rejects an item whose css nests keyframes inside @theme inline', async () => {
  const styled = {
    ...component,
    css: {
      '@theme inline': {
        '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
    },
  }
  const { status, stderr } = await run([styled, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": @utility and @keyframes belong in @delta-ui\/core\/tailwind\.css/)
})

const sfc = (script: string) => `<script setup lang="ts">\n${script}\n</script>\n\n<template><div /></template>\n`

type PublishedItem = { dependencies?: string[]; files: { path: string; content: string }[] }

const published = async (out: string, name: string) =>
  JSON.parse(await readFile(join(out, `${name}.json`), 'utf8')) as PublishedItem

test('publishes @/ imports under the registry alias the CLI rewrites', async () => {
  const source = sfc(
    [
      'import { Button } from "@/ui/button";',
      "import type { Size } from '@/lib/sizes';",
      'import "@/lib/side-effect";',
      'import Part from "./Part.vue";',
      'const lazy = () => import("@/ui/lazy");',
    ].join('\n'),
  )
  const shipping = {
    ...component,
    files: [
      { path: 'src/ui/demo/Demo.vue', type: 'registry:ui' },
      { path: 'src/ui/demo/Part.vue', type: 'registry:ui' },
      { path: 'src/ui/button/index.ts', type: 'registry:ui' },
      { path: 'src/ui/lazy/index.ts', type: 'registry:ui' },
      { path: 'src/lib/sizes.ts', type: 'registry:lib' },
      { path: 'src/lib/side-effect.ts', type: 'registry:lib' },
    ],
  }
  const { status, stderr, out } = await run(
    [shipping, example],
    {},
    {
      'src/ui/demo/Demo.vue': source,
      'src/ui/demo/Part.vue': '<template><div /></template>\n',
      'src/ui/button/index.ts': 'export const Button = {}\n',
      'src/ui/lazy/index.ts': 'export default {}\n',
      'src/lib/sizes.ts': 'export type Size = string\n',
      'src/lib/side-effect.ts': 'export {}\n',
    },
  )
  assert.equal(status, 0, stderr)
  const content = (await published(out, 'demo')).files[0]?.content ?? ''
  assert.match(content, /import \{ Button \} from "@\/registry\/delta-ui\/ui\/button";/)
  assert.match(content, /import type \{ Size \} from '@\/registry\/delta-ui\/lib\/sizes';/)
  assert.match(content, /import "@\/registry\/delta-ui\/lib\/side-effect";/)
  assert.match(content, /import Part from "\.\/Part\.vue";/)
  assert.match(content, /import\("@\/registry\/delta-ui\/ui\/lazy"\)/)
})

test('writes @delta-ui/core with the caret range of the core version', async () => {
  const { status, stderr, out } = await run([{ ...component, dependencies: ['@delta-ui/core', 'clsx'] }, example])
  assert.equal(status, 0, stderr)
  assert.deepEqual((await published(out, 'demo')).dependencies, ['@delta-ui/core@^1.2.3', 'clsx'])
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8')) as {
    items: { name: string; dependencies?: string[] }[]
  }
  assert.deepEqual(index.items.find((item) => item.name === 'demo')?.dependencies, ['@delta-ui/core@^1.2.3', 'clsx'])
})

test('publishes example files under components/examples, where the CLI keeps their folder', async () => {
  const { status, stderr, out } = await run([component, example])
  assert.equal(status, 0, stderr)
  assert.equal((await published(out, 'demo-example')).files[0]?.path, 'components/examples/demo/DemoExample.vue')
  assert.equal((await published(out, 'demo')).files[0]?.path, 'src/ui/demo/Demo.vue')
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8')) as {
    items: { name: string; files: { path: string }[] }[]
  }
  assert.equal(
    index.items.find((item) => item.name === 'demo-example')?.files[0]?.path,
    'components/examples/demo/DemoExample.vue',
  )
})

test('rejects a version written on @delta-ui/core in the manifest', async () => {
  const { status, stderr } = await run([{ ...component, dependencies: ['@delta-ui/core@^0.1.0'] }, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": list "@delta-ui\/core" without a version/)
})

test('rejects an import of a package the item does not list', async () => {
  const { status, stderr } = await run(
    [component, example],
    {},
    {
      'src/ui/demo/Demo.vue': sfc('import { X } from "@lucide/vue";'),
    },
  )
  assert.equal(status, 1)
  assert.match(
    stderr,
    /item "demo", file "src\/ui\/demo\/Demo\.vue": imports "@lucide\/vue", but "@lucide\/vue" is not in the dependencies of the item or its registryDependencies/,
  )
})

test('accepts a package listed by a registryDependency, a subpath of a listed package, and vue', async () => {
  const { status, stderr } = await run(
    [{ ...component, dependencies: ['@lucide/vue', '@delta-ui/core'] }, example],
    {},
    {
      'src/examples/demo/DemoExample.vue': sfc(
        'import { X } from "@lucide/vue";\nimport { DialogContent } from "@delta-ui/core/dialog";\nimport { ref } from "vue";',
      ),
    },
  )
  assert.equal(status, 0, stderr)
})

test('rejects an @/ import that nothing in the tree ships', async () => {
  const { status, stderr } = await run(
    [component, example],
    {},
    {
      'src/examples/demo/DemoExample.vue': sfc('import Stray from "@/other/Stray.vue";'),
    },
  )
  assert.equal(status, 1)
  assert.match(
    stderr,
    /item "demo-example", file "src\/examples\/demo\/DemoExample\.vue": imports "@\/other\/Stray\.vue", which neither the item nor its registryDependencies ship/,
  )
})

test('accepts an @/ import shipped two registryDependencies away', async () => {
  const base = {
    name: 'base',
    type: 'registry:lib',
    title: 'Base',
    description: 'A base helper.',
    files: [{ path: 'src/lib/base.ts', type: 'registry:lib' }],
  }
  const { status, stderr } = await run(
    [{ ...component, registryDependencies: ['base'] }, example, base],
    {},
    {
      'src/lib/base.ts': 'export const base = 1\n',
      'src/examples/demo/DemoExample.vue': sfc('import { base } from "@/lib/base";'),
    },
  )
  assert.equal(status, 0, stderr)
})

test('ignores template text that looks like an import', async () => {
  const { status, stderr, out } = await run(
    [component, example],
    {},
    {
      'src/examples/demo/DemoExample.vue':
        '<script setup lang="ts">\nconst message = { from: "Ada" }\n</script>\n\n<template>\n  <p :title="message.from"\n    class="text-body-md">{{ message.from }}</p>\n</template>\n',
    },
  )
  assert.equal(status, 0, stderr)
  const content = (await published(out, 'demo-example')).files[0]?.content ?? ''
  assert.match(content, /:title="message\.from"/)
})
