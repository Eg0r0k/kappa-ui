export type DependencyLink = { label: 'Reka UI' | '@kappa-ui/core'; href: string }

const REKA_DOCS = 'https://reka-ui.com/docs/components'
const CORE_TREE = 'https://github.com/Eg0r0k/kappa-ui/tree/main/packages/core/src'
const standalone: Record<string, string> = {
  AspectRatio: 'AspectRatio',
  Label: 'Label',
  Separator: 'Separator',
  SplitterGroup: 'Splitter',
  Toggle: 'Toggle',
}

const unique = <T>(values: T[]) => [...new Set(values)]
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const namedImports = (source: string, specifier: string) =>
  [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)]
    .filter((match) => match[2] === specifier)
    .flatMap((match) => match[1]!.split(','))
    .map((name) => name.trim())
    .filter((name) => name && !name.startsWith('type '))
    .map((name) => name.split(/\s+as\s+/)[0]!)

export const rekaFamilies = (source: string) =>
  unique(
    namedImports(source, 'reka-ui').flatMap((name) => {
      if (standalone[name]) return [standalone[name]]
      return name.endsWith('Root') && name !== 'Root' ? [name.slice(0, -'Root'.length)] : []
    }),
  )

export const coreModules = (source: string) =>
  unique([...source.matchAll(/from\s*["']@kappa-ui\/core\/([a-z-]+)["']/g)].map((match) => match[1]!))

export const dependencyLinks = (sources: readonly string[], item: string): DependencyLink[] => {
  const pick = (values: string[]) => values.find((value) => value === item) ?? values[0]
  const family = pick(unique(sources.flatMap(rekaFamilies).map(kebab)))
  const module = pick(unique(sources.flatMap(coreModules)))
  return [
    ...(family ? [{ label: 'Reka UI' as const, href: `${REKA_DOCS}/${family}` }] : []),
    ...(module ? [{ label: '@kappa-ui/core' as const, href: `${CORE_TREE}/${module}` }] : []),
  ]
}
