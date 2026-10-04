export type IconNode = [string, Record<string, string | number>][]

const INDEX_LINE = /export \{([^}]+)\} from '\.\/icons\/([a-z0-9-]+)\.mjs';/g
const LUCIDE_IMPORT = /import\s+\{([^}]*)\}\s*from\s*["']@lucide\/vue["']/g
const SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'

export const lucideIndexOf = (indexSource: string) => {
  const index = new Map<string, string>()
  for (const [, names, file] of indexSource.matchAll(INDEX_LINE)) {
    for (const [, name] of names.matchAll(/default as (\w+)/g)) index.set(name, file)
  }
  return index
}

export const lucideImportsOf = (source: string) =>
  [...source.matchAll(LUCIDE_IMPORT)].flatMap(([, specifiers]) =>
    specifiers
      .split(',')
      .map((specifier) => specifier.trim())
      .filter((specifier) => specifier !== '' && !specifier.startsWith('type '))
      .map((specifier) => specifier.split(/\s+as\s+/)[0]),
  )

export const iconFilesOf = (sources: string[], index: Map<string, string>, extra: string[]) => {
  const known = new Set(index.values())
  const files = new Set<string>()
  for (const name of extra) {
    if (!known.has(name)) throw new Error(`Unknown lucide icon: ${name}`)
    files.add(name)
  }
  for (const name of sources.flatMap(lucideImportsOf)) {
    const file = index.get(name)
    if (!file) throw new Error(`Unknown @lucide/vue export: ${name}`)
    files.add(file)
  }
  return [...files].sort()
}

const attributesOf = (attributes: Record<string, string | number>) =>
  Object.entries(attributes)
    .filter(([name]) => name !== 'key')
    .map(([name, value]) => ` ${name}="${value}"`)
    .join('')

export const svgOf = (node: IconNode) =>
  `${SVG_OPEN}${node.map(([tag, attributes]) => `<${tag}${attributesOf(attributes)}/>`).join('')}</svg>`
