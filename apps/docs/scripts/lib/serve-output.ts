import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.xml': 'application/xml',
}

const isFile = (file: string) => existsSync(file) && statSync(file).isFile()

const resolveFile = (root: string, url: string) => {
  const path = normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '')
  return [join(root, path), join(root, `${path}.html`), join(root, path, 'index.html')].find(isFile)
}

/** Serves a `nuxt generate` output the way the host does: `/docs/button` is `docs/button.html`. */
export const serveOutput = (root: string) =>
  new Promise<{ url: string; close: () => void }>((done) => {
    const server = createServer((request, response) => {
      const file = resolveFile(root, request.url ?? '/')
      if (!file) {
        response.writeHead(404)
        response.end('Not found')
        return
      }
      response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
      createReadStream(file).pipe(response)
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number }
      done({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
