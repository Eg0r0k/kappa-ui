import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({
  options: {
    core: { type: 'string', default: 'packages/core/package.json' },
    'dry-run': { type: 'boolean', default: false },
  },
})

const fail = (message: string): never => {
  console.error(`release: ${message}`)
  process.exit(1)
}

const capture = async (command: string) => {
  const child = spawn(command, { cwd: repoRoot, shell: true })
  let stdout = ''
  let stderr = ''
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk))
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk))
  const [code] = (await once(child, 'close')) as [number | null]
  return { code, stdout, stderr }
}

const step = async (command: string) => {
  console.log(`release: ${command}`)
  const child = spawn(command, { cwd: repoRoot, shell: true, stdio: 'inherit' })
  const [code] = (await once(child, 'close')) as [number | null]
  if (code !== 0) fail(`${command} failed`)
}

const isPublished = async (name: string, version: string) => {
  const { code, stdout, stderr } = await capture(`npm view ${name}@${version} version`)
  if (code === 0) return stdout.trim() === version
  if (/E404/.test(`${stdout}${stderr}`)) return false
  return fail(`npm view ${name}@${version} failed\n${stderr}`)
}

const core = JSON.parse(await readFile(resolve(repoRoot, values.core), 'utf8')) as { name: string; version: string }
const spec = `${core.name}@${core.version}`
const published = await isPublished(core.name, core.version)
console.log(published ? `release: ${spec} already on npm` : `release: publishing ${spec}`)
if (values['dry-run']) process.exit(0)

if (!published) {
  await step('pnpm smoke')
  const packDir = await mkdtemp(join(tmpdir(), 'kappa-release-'))
  await step(`pnpm --filter ${core.name} pack --pack-destination "${packDir}"`)
  const tarball = (await readdir(packDir)).find((file) => file.endsWith('.tgz')) ?? fail(`no tarball in ${packDir}`)
  await step(`npm publish "${join(packDir, tarball)}" --access public --provenance`)
  await rm(packDir, { recursive: true, force: true })
}
await step('pnpm changeset tag')
