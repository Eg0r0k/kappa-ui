import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

type Item = { name: string; categories?: string[]; files: { path: string }[] }
type CorePackage = {
  name: string
  version: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}
type Template = { name: string; sourceDir: string; page: string; checks: [step: string, command: string][] }

const TEMPLATES: Template[] = [
  {
    name: 'vite',
    sourceDir: 'src',
    page: 'src/App.vue',
    checks: [
      ['typecheck', 'pnpm exec vue-tsc --noEmit'],
      ['build', 'pnpm exec vite build'],
    ],
  },
  {
    name: 'nuxt',
    sourceDir: 'app',
    page: 'app/app.vue',
    checks: [
      ['typecheck', 'pnpm exec nuxi typecheck'],
      ['generate', 'pnpm exec nuxi generate'],
    ],
  },
]

const ADD_BATCH = 60
const STEP_TIMEOUT_MS = 15 * 60 * 1000

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({
  options: {
    keep: { type: 'boolean', default: false },
    only: { type: 'string' },
  },
})

const templates = TEMPLATES.filter((template) => values.only === undefined || template.name === values.only)
if (templates.length === 0) {
  console.error(`smoke: --only must be one of ${TEMPLATES.map((template) => template.name).join(', ')}`)
  process.exit(1)
}

const workDir = await mkdtemp(join(tmpdir(), 'delta-smoke-'))

const fail = (step: string, output: string): never => {
  console.error(`smoke: ${step} failed\n\n${output}\n\nsmoke: work directory kept at ${workDir}`)
  process.exit(1)
}

const run = async (step: string, command: string, cwd: string, env: Record<string, string> = {}) => {
  console.log(`smoke: ${step}`)
  const child = spawn(command, { cwd, shell: true, timeout: STEP_TIMEOUT_MS, env: { ...process.env, ...env } })
  let output = ''
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk))
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk))
  const [code, signal] = (await once(child, 'close')) as [number | null, NodeJS.Signals | null]
  if (code !== 0) fail(step, output || `exit ${code ?? signal}`)
}

const readJson = async <T>(path: string) => JSON.parse(await readFile(path, 'utf8')) as T

const manifest = await readJson<{ items: Item[] }>(join(repoRoot, 'packages/registry/registry.json'))
const core = await readJson<CorePackage>(join(repoRoot, 'packages/core/package.json'))

const packDir = join(workDir, 'pack')
await mkdir(packDir)
await run('pack @delta-ui/core', `pnpm --filter ${core.name} pack --pack-destination "${packDir}"`, repoRoot)
const tarballName =
  (await readdir(packDir)).find((file) => file.endsWith('.tgz')) ??
  fail('pack @delta-ui/core', `no tarball in ${packDir}`)
const tarballPath = join(packDir, tarballName)
await run('publint', 'pnpm exec publint --pack pnpm', join(repoRoot, 'packages/core'))
await run(
  'attw',
  `pnpm exec attw "${tarballPath}" --profile esm-only --exclude-entrypoints ./tailwind.css`,
  join(repoRoot, 'packages/core'),
)
const tarball = await readFile(tarballPath)

const server = createServer()
await new Promise<void>((done) => server.listen(0, '127.0.0.1', () => done()))
const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
const registryDir = join(workDir, 'r')

const packument = {
  name: core.name,
  'dist-tags': { latest: core.version },
  versions: {
    [core.version]: {
      name: core.name,
      version: core.version,
      dependencies: core.dependencies ?? {},
      peerDependencies: core.peerDependencies ?? {},
      dist: {
        tarball: `${origin}/npm/-/core.tgz`,
        integrity: `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
      },
    },
  },
}

server.on('request', async (request, response) => {
  const url = decodeURIComponent(request.url ?? '/')
  if (url === `/npm/${core.name}`) {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(packument))
    return
  }
  if (url === '/npm/-/core.tgz') {
    response.writeHead(200, { 'content-type': 'application/octet-stream' })
    response.end(tarball)
    return
  }
  const file = join(registryDir, url.replace(/^\/r\//, ''))
  if (url.startsWith('/r/') && existsSync(file)) {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(await readFile(file))
    return
  }
  response.writeHead(404)
  response.end()
})

await run('build the registry', `"${process.execPath}" scripts/build-registry.ts --out "${registryDir}"`, repoRoot, {
  DELTA_UI_URL: origin,
})

const itemNames = manifest.items.map((item) => `@delta/${item.name}`)
const batches = Array.from({ length: Math.ceil(itemNames.length / ADD_BATCH) }, (_, index) =>
  itemNames.slice(index * ADD_BATCH, (index + 1) * ADD_BATCH),
)
const examples = manifest.items
  .filter((item) => item.categories?.includes('example'))
  .flatMap((item) => item.files.map((file) => file.path.replace(/^src\/examples\//, '')))

const examplesPage = (paths: string[]) =>
  [
    '<script setup lang="ts">',
    ...paths.map((path, index) => `import Example${index} from "@/${path}";`),
    '</script>',
    '',
    '<template>',
    '  <main>',
    ...paths.map((_, index) => `    <Example${index} />`),
    '  </main>',
    '</template>',
    '',
  ].join('\n')

const smoke = async (template: Template) => {
  const dir = join(workDir, template.name)
  const label = (step: string) => `${template.name}: ${step}`
  await cp(join(repoRoot, 'scripts/smoke', template.name), dir, { recursive: true })
  await writeFile(join(dir, '.npmrc'), `@delta-ui:registry=${origin}/npm/\n`)
  await run(label('install'), 'pnpm install', dir)
  await run(label('shadcn-vue init'), 'pnpm exec shadcn-vue init --yes --defaults --base-color neutral', dir)
  const configPath = join(dir, 'components.json')
  const config = await readJson<{ registries?: Record<string, string> }>(configPath)
  await writeFile(
    configPath,
    `${JSON.stringify({ ...config, registries: { ...config.registries, '@delta': `${origin}/r/{name}.json` } }, null, 2)}\n`,
  )
  for (const [index, batch] of batches.entries()) {
    await run(
      label(`shadcn-vue add (${index + 1}/${batches.length})`),
      `pnpm exec shadcn-vue add ${batch.join(' ')} --yes --overwrite`,
      dir,
    )
  }
  const installed = (await readdir(join(dir, template.sourceDir, 'components'), { recursive: true })).map(
    (file) => `components/${file.replaceAll('\\', '/')}`,
  )
  const located = examples.map((path) => installed.find((file) => file.endsWith(`/${path}`)))
  const missing = examples.filter((_, index) => located[index] === undefined)
  if (missing.length > 0) fail(label('examples'), `not installed:\n${missing.join('\n')}`)
  await writeFile(join(dir, template.page), examplesPage(located.filter((path) => path !== undefined)))
  for (const [step, command] of template.checks) await run(label(step), command, dir)
}

for (const template of templates) await smoke(template)

server.close()
if (values.keep) {
  console.log(`smoke: passed; work directory kept at ${workDir}`)
} else {
  await rm(workDir, { recursive: true, force: true })
  console.log('smoke: passed')
}
