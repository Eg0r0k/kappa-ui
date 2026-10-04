import { readdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import { bundleOf } from './bundle.ts'
import { iconFilesOf, type IconNode, lucideIndexOf, svgOf } from './icons.ts'
import type { IconPayload } from './payload.ts'
import { tokensOf } from './tokens.ts'

const root = join(import.meta.dirname, '../..')
const PORT = 9232
const LIFETIME = 120_000
const USAGE =
  'Usage: node scripts/figma/cli.ts tokens [--theme light|dark] [--prune] | icons [name…] | run <file.ts…> [--call build] [--payload <json>]'

const read = (path: string) => readFileSync(join(root, path), 'utf8')

const runtime = (...files: string[]) => files.map((file) => ({ file, source: read(`scripts/figma/runtime/${file}`) }))

const walk = (dir: string): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
  )

const tokensBundle = (args: string[]) => {
  const { values } = parseArgs({
    args,
    options: { theme: { type: 'string', default: 'light' }, prune: { type: 'boolean', default: false } },
  })
  if (values.theme !== 'light' && values.theme !== 'dark')
    throw new Error(`--theme is light or dark, got ${values.theme}`)
  const sources = {
    tokens: read('packages/core/src/tokens.css'),
    theme: read('packages/core/src/theme.css'),
    tailwind: read('packages/core/src/tailwind.css'),
  }
  const { payload, gamutMapped } = tokensOf(sources, { theme: values.theme, prune: values.prune })
  const counts = `${payload.variables.length} variables, ${payload.textStyles.length} text styles, ${payload.effectStyles.length} effect styles`
  console.log(`${counts} (${payload.theme}${payload.prune ? ', prune' : ''})`)
  if (gamutMapped.length > 0) console.log(`Gamut-mapped into sRGB: ${gamutMapped.join(', ')}`)
  return bundleOf(runtime('shared.ts', 'boards.ts', 'tokens.ts'), 'syncTokens', payload)
}

const iconsBundle = async (args: string[]) => {
  const lucide = dirname(
    createRequire(join(root, 'packages/registry/package.json')).resolve('@lucide/vue/package.json'),
  )
  const index = lucideIndexOf(readFileSync(join(lucide, 'dist/esm/lucide-vue.mjs'), 'utf8'))
  const sources = walk('packages/registry/src')
    .filter((file) => /\.(ts|vue)$/.test(file))
    .map(read)
  const icons = await Promise.all(
    iconFilesOf(sources, index, args).map(async (file) => {
      const url = pathToFileURL(join(lucide, 'dist/esm/icons', `${file}.mjs`)).href
      const { __iconData } = (await import(url)) as { __iconData: { node: IconNode } }
      return { id: `Icon/${file}`, name: `icon/${file}`, svg: svgOf(__iconData.node) }
    }),
  )
  console.log(`${icons.length} icons`)
  const payload: IconPayload = { icons }
  return bundleOf(runtime('shared.ts', 'icons.ts'), 'syncIcons', payload)
}

const runBundle = (args: string[]) => {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: { call: { type: 'string', default: 'build' }, payload: { type: 'string', default: '{}' } },
  })
  if (positionals.length === 0) throw new Error(USAGE)
  const entries = positionals.map((file) => ({ file, source: readFileSync(resolve(file), 'utf8') }))
  return bundleOf([...runtime('shared.ts'), ...entries], values.call, JSON.parse(values.payload))
}

const serve = (kind: string, bundle: string) => {
  const stop = () => {
    server.close()
    server.closeAllConnections()
  }
  const server = createServer((request, response) => {
    if (request.url !== `/${kind}.js`) {
      response.writeHead(404).end()
      return
    }
    const headers = { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*', Connection: 'close' }
    response.on('finish', stop)
    response.writeHead(200, headers).end(bundle)
    console.log(`Served ${kind}.js (${bundle.length} bytes)`)
  })
  const timer = setTimeout(() => {
    console.log('Nobody fetched the bundle; stopping.')
    stop()
  }, LIFETIME)
  server.on('close', () => clearTimeout(timer))
  server.listen(PORT, 'localhost', () => {
    console.log('Run in figma_execute with timeout 30000:')
    console.log(`const source = await (await fetch('http://localhost:${PORT}/${kind}.js')).text()`)
    console.log('return await eval(`(async () => {\\n${source}\\n})()`)')
  })
}

const builders: Record<string, (args: string[]) => string | Promise<string>> = {
  tokens: tokensBundle,
  icons: iconsBundle,
  run: runBundle,
}

const [kind = '', ...args] = process.argv.slice(2)
const build = builders[kind]
if (!build) throw new Error(USAGE)
serve(kind, await build(args))
