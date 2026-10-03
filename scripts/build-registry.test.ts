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

const base = {
  name: 'init',
  type: 'registry:base',
  title: 'Project setup',
  description: 'Sets up the project.',
  extends: 'none',
  config: { tailwind: { baseColor: 'neutral' } },
  registryDependencies: ['demo'],
  files: [],
}

const run = async (items: unknown[], env: Record<string, string> = {}, files: Record<string, string> = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'kappa-registry-'))
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
  await writeFile(
    join(root, 'core.json'),
    JSON.stringify({ name: '@kappa-ui/core', version: '1.2.3', peerDependencies: { 'reka-ui': '^4.5.6' } }),
  )
  const out = join(root, 'out')
  const css = join(root, 'registry.css')
  const result = spawnSync(
    process.execPath,
    [script, '--manifest', join(root, 'registry.json'), '--out', out, '--core', join(root, 'core.json'), '--css', css],
    {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    },
  )
  return { status: result.status, stderr: result.stderr, out, css }
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

test('builds dependency URLs and the homepage from KAPPA_UI_URL', async () => {
  const { status, stderr, out } = await run([component, example], { KAPPA_UI_URL: 'https://example.test/' })
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
  assert.match(stderr, /item "demo": @utility and @keyframes belong in @kappa-ui\/core\/tailwind.css/)
})

test('accepts an item that imports the core stylesheet', async () => {
  const styled = { ...component, css: { '@import "@kappa-ui/core/tailwind.css"': {} } }
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
    /item "glow", file "src\/other\/glow\.css": @utility and @keyframes belong in @kappa-ui\/core\/tailwind\.css/,
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
  assert.match(stderr, /item "demo": @utility and @keyframes belong in @kappa-ui\/core\/tailwind\.css/)
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
      'src/ui/button/index.ts': 'import { x } from "@/lib/sizes";\n\nexport const Button = { x }\n',
      'src/ui/lazy/index.ts': 'export default {}\n',
      'src/lib/sizes.ts': 'export type Size = string\n',
      'src/lib/side-effect.ts': 'export {}\n',
    },
  )
  assert.equal(status, 0, stderr)
  const item = await published(out, 'demo')
  const content = item.files[0]?.content ?? ''
  assert.match(content, /import \{ Button \} from "@\/registry\/kappa-ui\/ui\/button";/)
  assert.match(content, /import type \{ Size \} from '@\/registry\/kappa-ui\/lib\/sizes';/)
  assert.match(content, /import "@\/registry\/kappa-ui\/lib\/side-effect";/)
  assert.match(content, /import Part from "\.\/Part\.vue";/)
  assert.match(content, /import\("@\/registry\/kappa-ui\/ui\/lazy"\)/)

  const buttonIndex = item.files.find((file) => file.path === 'src/ui/button/index.ts')
  assert.match(buttonIndex?.content ?? '', /import \{ x \} from "@\/registry\/kappa-ui\/lib\/sizes";/)
})

test('writes @kappa-ui/core with the caret range of the core version', async () => {
  const { status, stderr, out } = await run([{ ...component, dependencies: ['@kappa-ui/core', 'clsx'] }, example])
  assert.equal(status, 0, stderr)
  assert.deepEqual((await published(out, 'demo')).dependencies, ['@kappa-ui/core@^1.2.3', 'clsx'])
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8')) as {
    items: { name: string; dependencies?: string[] }[]
  }
  assert.deepEqual(index.items.find((item) => item.name === 'demo')?.dependencies, ['@kappa-ui/core@^1.2.3', 'clsx'])
})

test('writes reka-ui with the range core takes it as a peer in', async () => {
  const { status, stderr, out } = await run([{ ...component, dependencies: ['reka-ui', '@kappa-ui/core'] }, example])
  assert.equal(status, 0, stderr)
  assert.deepEqual((await published(out, 'demo')).dependencies, ['reka-ui@^4.5.6', '@kappa-ui/core@^1.2.3'])
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

test('rejects a version written on @kappa-ui/core in the manifest', async () => {
  const { status, stderr } = await run([{ ...component, dependencies: ['@kappa-ui/core@^0.1.0'] }, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": list "@kappa-ui\/core" without a version/)
})

test('rejects a version written on reka-ui in the manifest', async () => {
  const { status, stderr } = await run([{ ...component, dependencies: ['reka-ui@^2.0.0'] }, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": list "reka-ui" without a version/)
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
    [{ ...component, dependencies: ['@lucide/vue', '@kappa-ui/core'] }, example],
    {},
    {
      'src/examples/demo/DemoExample.vue': sfc(
        'import { X } from "@lucide/vue";\nimport { DialogContent } from "@kappa-ui/core/dialog";\nimport { ref } from "vue";',
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

test('publishes a registry:base config with the kappa-ui registry added', async () => {
  const { status, stderr, out } = await run([component, example, base], { KAPPA_UI_URL: 'https://example.test' })
  assert.equal(status, 0, stderr)
  const item = JSON.parse(await readFile(join(out, 'init.json'), 'utf8')) as { extends?: string; config?: unknown }
  assert.equal(item.extends, 'none')
  assert.deepEqual(item.config, {
    tailwind: { baseColor: 'neutral' },
    registries: { '@kappa-ui': 'https://example.test/r/{name}.json' },
  })
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8')) as {
    items: { name: string; config?: unknown }[]
  }
  assert.deepEqual(index.items.find((entry) => entry.name === 'init')?.config, item.config)
})

test('rejects a registry:base without a config', async () => {
  const { status, stderr } = await run([component, example, { ...base, config: undefined }])
  assert.equal(status, 1)
  assert.match(stderr, /item "init": registry:base needs a config object/)
})

test('rejects a config on any other item type', async () => {
  const { status, stderr } = await run([{ ...component, config: {} }, example])
  assert.equal(status, 1)
  assert.match(stderr, /item "demo": config is only allowed on registry:base/)
})

const tokensItem = {
  name: 'tokens',
  type: 'registry:lib',
  title: 'Tokens',
  description: 'Tokens.',
  cssSource: 'styles/tokens.css',
  files: [],
}

test('resolves cssSource into css and cssVars and drops the field', async () => {
  const { status, stderr, out } = await run(
    [component, example, tokensItem],
    {},
    {
      'styles/tokens.css': ':root {\n  --a: 1px;\n}\n\n.dark {\n  color-scheme: dark;\n  --a: 2px;\n}\n',
    },
  )
  assert.equal(status, 0, stderr)
  const item = JSON.parse(await readFile(join(out, 'tokens.json'), 'utf8'))
  assert.deepEqual(item.cssVars, { light: { a: '1px' }, dark: { a: '2px' } })
  assert.deepEqual(item.css, { '.dark': { 'color-scheme': 'dark' } })
  assert.equal(item.cssSource, undefined)
  const index = JSON.parse(await readFile(join(out, 'registry.json'), 'utf8'))
  const indexed = index.items.find((entry: { name: string }) => entry.name === 'tokens')
  assert.deepEqual(indexed.cssVars, item.cssVars)
  assert.equal(indexed.cssSource, undefined)
})

test('rejects cssSource next to css or cssVars', async () => {
  const { status, stderr } = await run(
    [component, example, { ...tokensItem, cssVars: { light: { a: '1px' } } }],
    {},
    { 'styles/tokens.css': ':root {}\n' },
  )
  assert.equal(status, 1)
  assert.match(stderr, /item "tokens": declares css or cssVars next to cssSource/)
})

test('rejects a missing cssSource', async () => {
  const { status, stderr } = await run([component, example, { ...tokensItem, cssSource: 'nope.css' }])
  assert.equal(status, 1)
  assert.match(stderr, /item "tokens": cssSource not found — nope.css/)
})

test('rejects two items that declare one variable differently', async () => {
  const one = {
    name: 'one',
    type: 'registry:lib',
    title: 'One',
    description: 'One.',
    cssVars: { light: { a: '1px' } },
    files: [],
  }
  const two = { ...one, name: 'two', title: 'Two', cssVars: { light: { a: '2px' } } }
  const { status, stderr } = await run([component, example, one, two])
  assert.equal(status, 1)
  assert.match(stderr, /cssVars.light > --a: "one" declares 1px, "two" declares 2px/)
})

test('writes the merged stylesheet of every item that is not an example', async () => {
  const one = {
    name: 'one',
    type: 'registry:lib',
    title: 'One',
    description: 'One.',
    cssVars: { light: { a: '1px' } },
    files: [],
  }
  const { status, stderr, css } = await run([component, example, one])
  assert.equal(status, 0, stderr)
  assert.match(await readFile(css, 'utf8'), /:root, \.light \{\n {2}--a: 1px;\n\}/)
})

test('the committed registry.css is what the build generates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kappa-registry-css-'))
  const result = spawnSync(process.execPath, [script, '--out', join(dir, 'r'), '--css', join(dir, 'registry.css')], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  const committed = resolve(dirname(script), '../apps/docs/app/assets/css/registry.css')
  assert.equal(
    await readFile(join(dir, 'registry.css'), 'utf8'),
    await readFile(committed, 'utf8'),
    'registry.css is stale: run pnpm registry:build and commit it',
  )
})
