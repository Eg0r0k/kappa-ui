import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

// Compiles @kappa-ui/core/tailwind.css the way a user's Tailwind build does, with and without kappa's tokens item.

type Compiler = {
  build: (candidates: string[]) => string
}
type Tailwind = {
  compile: (
    css: string,
    options: { base: string; loadStylesheet: (id: string, base: string) => Promise<Stylesheet> },
  ) => Promise<Compiler>
}
type Stylesheet = { path: string; base: string; content: string }

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const coreCss = join(repoRoot, 'packages/core/src/tailwind.css')
const tokensCss = join(repoRoot, 'packages/core/src/tokens.css')

// tailwindcss lives in the registry's node_modules, not the root's.
const require = createRequire(join(repoRoot, 'packages/registry/package.json'))
const tailwindRoot = dirname(require.resolve('tailwindcss/package.json'))
const { compile } = require('tailwindcss') as Tailwind

const loadStylesheet = async (id: string, base: string): Promise<Stylesheet> => {
  const path =
    id === 'tailwindcss'
      ? join(tailwindRoot, 'index.css')
      : id === '@kappa-ui/core/tailwind.css'
        ? coreCss
        : id.startsWith('tailwindcss/')
          ? join(tailwindRoot, `${id.slice('tailwindcss/'.length)}.css`)
          : resolve(base, id)
  return { path, base: dirname(path), content: await readFile(path, 'utf8') }
}

// The theme `shadcn-vue init` writes for Tailwind v4: no destructive-foreground, no status colours, no kappa tokens.
const shadcnTheme = `
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}
`

const source = await readFile(coreCss, 'utf8')
const tokensSource = await readFile(tokensCss, 'utf8')

// Every utility core defines, so a reference inside any of them is resolved; functional ones get a sample value.
const candidates = [...source.matchAll(/^@utility ([\w-]+(?:-\*)?) \{/gm)].map(([, name]) =>
  name.endsWith('-*') ? `${name.slice(0, -2)}-4` : name,
)
// Variants the registry puts these utilities behind, and the tone colours core adds to the theme.
candidates.push(
  'aria-invalid:tone-invalid',
  'data-[state=checked]:bg-tone',
  'bg-tone-soft',
  'text-tone-foreground',
  'border-tone-border',
)

const build = async (css: string) => (await compile(css, { base: repoRoot, loadStylesheet })).build(candidates)

const withoutTokens = `@import "tailwindcss";\n${shadcnTheme}\n@import "@kappa-ui/core/tailwind.css";\n`
// tokens.css starts with its own `@import "@kappa-ui/core/tailwind.css"`, as the copied registry item does.
const withTokens = `@import "tailwindcss";\n${shadcnTheme}\n${tokensSource}\n`

// The declarations of the first rule whose selector list contains `selector`.
const block = (css: string, selector: string) => {
  const start = [...css.matchAll(/^\s*([^{}\n]+)\{/gm)].find(([, selectors]) =>
    selectors!.split(',').some((part) => part.trim() === selector),
  )
  assert.ok(start, `expected a rule for ${selector}`)
  return css.slice(start.index, css.indexOf('}', start.index))
}

test('core compiles next to a plain shadcn theme, without kappa tokens', async () => {
  const css = await build(withoutTokens)

  assert.match(block(css, '[data-slot][data-color="primary"]'), /--tone: var\(--primary\);/)
  assert.match(block(css, '[data-slot][data-color="destructive"]'), /--tone-foreground: oklch\(1 0 0\);/)
  assert.match(block(css, '[data-slot][data-color="success"]'), /--tone: oklch\(0\.72 0\.17 150\);/)
  assert.match(block(css, '[data-slot][data-color="warning"]'), /--tone-text: oklch\(0\.54 0\.14 58\);/)
  assert.match(block(css, '[data-slot][data-color="info"]'), /--tone-foreground: oklch\(0\.26 0\.065 261\);/)
  assert.match(css, /opacity: var\(--state-hover, 8%\)/)
  assert.match(css, /scale\(var\(--press-scale, 0\.97\)\)/)
})

test('core compiles with kappa tokens, and the tokens win over the fallbacks', async () => {
  const css = await build(withTokens)

  assert.match(block(css, '[data-slot][data-color="primary"]'), /--tone: var\(--primary\);/)
  assert.match(
    block(css, '[data-slot][data-color="destructive"]'),
    /--tone-foreground: var\(--destructive-foreground, oklch\(1 0 0\)\);/,
  )
  assert.match(block(css, '[data-slot][data-color="success"]'), /--tone: var\(--success, oklch\(0\.72 0\.17 150\)\);/)
  assert.match(css, /:root \{[^}]*--state-hover: 8%;/)
})

// Kappa's own names: the :root variables and @theme names tokens.css declares.
const kappaTokens = new Set([...tokensSource.matchAll(/^\s*(--[\w-]+):/gm)].map(([, name]) => name))

test('every kappa token core reads carries a fallback', () => {
  const references = [...source.matchAll(/(var|--theme)\((--[\w-]+)(\)|,)/g)]
  const bare = references
    .filter(([, , name, end]) => kappaTokens.has(name) && end === ')')
    .map(([reference]) => reference)
  assert.ok(references.length > 0)
  assert.deepEqual([...new Set(bare)], [])
})
