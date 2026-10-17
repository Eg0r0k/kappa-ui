import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const filesUnder = async (path: string): Promise<string[]> => {
  if (!(await stat(path)).isDirectory()) return [path]
  const entries = await readdir(path, { recursive: true, withFileTypes: true })
  return entries.filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name))
}

export const stampOf = async (root: string, inputs: string[]) => {
  const files = (await Promise.all(inputs.map(filesUnder))).flat()
  const keyed = files.map((file) => [relative(root, file).replaceAll('\\', '/'), file] as const)
  const hash = createHash('sha256')
  for (const [key, file] of keyed.sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    hash
      .update(key)
      .update('\0')
      .update(await readFile(file))
      .update('\0')
  }
  return hash.digest('hex')
}
