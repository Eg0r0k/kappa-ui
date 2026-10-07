import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'release.ts')

const packument = (versions: string[]) => ({
  name: '@kappa-ui/core',
  'dist-tags': { latest: versions.at(-1) },
  versions: Object.fromEntries(
    versions.map((version) => [
      version,
      { name: '@kappa-ui/core', version, dist: { tarball: `http://127.0.0.1/core-${version}.tgz` } },
    ]),
  ),
})

const dryRun = async (versions: string[] | null) => {
  const server = createServer((request, response) => {
    if (versions && decodeURIComponent(request.url ?? '') === '/@kappa-ui/core') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(packument(versions)))
      return
    }
    response.writeHead(404, { 'content-type': 'application/json' })
    response.end('{"error":"Not found"}')
  })
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', () => done()))
  const root = await mkdtemp(join(tmpdir(), 'kappa-release-test-'))
  const core = join(root, 'package.json')
  await writeFile(core, JSON.stringify({ name: '@kappa-ui/core', version: '1.2.3' }))
  const child = spawn(process.execPath, [script, '--dry-run', '--core', core], {
    env: { ...process.env, npm_config_registry: `http://127.0.0.1:${(server.address() as AddressInfo).port}/` },
  })
  let output = ''
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk))
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk))
  const [code] = (await once(child, 'close')) as [number | null]
  server.close()
  await rm(root, { recursive: true, force: true })
  return { code, output }
}

test('publishes a package npm has never seen', async () => {
  const { code, output } = await dryRun(null)
  assert.equal(code, 0, output)
  assert.match(output, /release: publishing @kappa-ui\/core@1\.2\.3/)
})

test('publishes a version npm does not have yet', async () => {
  const { code, output } = await dryRun(['1.2.2'])
  assert.equal(code, 0, output)
  assert.match(output, /release: publishing @kappa-ui\/core@1\.2\.3/)
})

test('skips a version already on npm', async () => {
  const { code, output } = await dryRun(['1.2.2', '1.2.3'])
  assert.equal(code, 0, output)
  assert.match(output, /release: @kappa-ui\/core@1\.2\.3 already on npm/)
})
