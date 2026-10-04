export type DependencyLabel = 'Reka UI' | 'Kappa UI' | 'TanStack Table' | 'TanStack Virtual'
export type DependencyLink = { label: DependencyLabel; href: string }

const REKA = 'https://reka-ui.com/docs'
const CORE_TREE = 'https://github.com/Eg0r0k/kappa-ui/tree/main/packages/core/src'
const standalone: Record<string, string> = {
  AspectRatio: 'AspectRatio',
  Label: 'Label',
  Separator: 'Separator',
  SplitterGroup: 'Splitter',
  Toggle: 'Toggle',
}
const tanstack: Record<string, DependencyLink> = {
  '@tanstack/vue-table': {
    label: 'TanStack Table',
    href: 'https://tanstack.com/table/latest/docs/framework/vue/vue-table',
  },
  '@tanstack/vue-virtual': {
    label: 'TanStack Virtual',
    href: 'https://tanstack.com/virtual/latest/docs/framework/vue/vue-virtual',
  },
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

const rekaHref = (sources: readonly string[], item: string, usesCore: boolean) => {
  const families = unique(sources.flatMap(rekaFamilies).map(kebab))
  const family = families.find((value) => value === item) ?? families[0]
  if (family) return `${REKA}/components/${family}`
  if (sources.some((source) => namedImports(source, 'reka-ui').includes('Primitive')))
    return `${REKA}/utilities/primitive`
  return usesCore ? undefined : `${REKA}/overview/introduction`
}

const coreHref = (sources: readonly string[], item: string) => {
  const modules = unique(sources.flatMap(coreModules))
  const module = modules.find((value) => value === item) ?? modules[0]
  return module ? `${CORE_TREE}/${module}` : CORE_TREE
}

export const dependencyLinks = (
  sources: readonly string[],
  item: string,
  packages: readonly string[],
): DependencyLink[] => {
  const usesCore = packages.includes('@kappa-ui/core') || sources.some((source) => coreModules(source).length > 0)
  const reka = packages.includes('reka-ui') ? rekaHref(sources, item, usesCore) : undefined
  return [
    ...(reka ? [{ label: 'Reka UI' as const, href: reka }] : []),
    ...(usesCore ? [{ label: 'Kappa UI' as const, href: coreHref(sources, item) }] : []),
    ...packages.flatMap((name) => (tanstack[name] ? [tanstack[name]] : [])),
  ]
}
