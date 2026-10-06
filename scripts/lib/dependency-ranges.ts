export const CORE_PACKAGE = '@kappa-ui/core'
export const REKA_PACKAGE = 'reka-ui'

export const CORE_MANIFEST = 'packages/core/package.json'
export const REGISTRY_MANIFEST = 'packages/registry/package.json'

export type PackageManifest = {
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// workspace:, link: and file: ranges only resolve inside this repo
const LOCAL_RANGE = /^(workspace|link|file|portal):/

/**
 * The range every npm package an item lists is installed in. Core installs at its own version and reka-ui in
 * the range core takes it as a peer in, so the two never disagree; every other package in the range the
 * registry's dependencies give it, the ones its components and examples are developed and tested against. Its
 * devDependencies are tooling no project installs (vite, vitest, typescript), so they give no range, and an item
 * that lists one fails the build.
 */
export const dependencyRanges = (core: PackageManifest, registry: PackageManifest): Map<string, string> => {
  if (!core.version) throw new Error('the core package has no version')
  const reka = core.peerDependencies?.[REKA_PACKAGE]
  if (!reka) throw new Error(`the core package has no peerDependencies["${REKA_PACKAGE}"]`)
  const ranges = new Map(Object.entries(registry.dependencies ?? {}).filter(([, range]) => !LOCAL_RANGE.test(range)))
  ranges.set(CORE_PACKAGE, `^${core.version}`)
  ranges.set(REKA_PACKAGE, reka)
  return ranges
}

export const rangeSource = (name: string) =>
  name === CORE_PACKAGE || name === REKA_PACKAGE ? CORE_MANIFEST : `the dependencies in ${REGISTRY_MANIFEST}`

/**
 * Packages the shadcn-vue CLI installs itself, so the published items list them without a range. The CLI swaps
 * an icon library's package for the one components.json names, recognising it only by its bare name: given
 * `@lucide/vue@^1.47.0` it installs that and a bare `@lucide/vue` as well, and pnpm saves the second one's range
 * under another package's key in package.json. The docs' Manual tab, which skips the CLI, still shows the range.
 */
export const CLI_MANAGED_PACKAGES: ReadonlySet<string> = new Set(['@lucide/vue'])

/** How a published item lists a package: with its range, or bare when the CLI installs it. */
export const publishedDependency = (name: string, ranges: ReadonlyMap<string, string>) =>
  CLI_MANAGED_PACKAGES.has(name) ? name : `${name}@${ranges.get(name)}`

/**
 * The ranges of the packages the items list, for the docs' Manual tab. The runtime config it travels in is
 * serialized into every page, so it carries these and nothing else.
 */
export const listedRanges = (
  ranges: ReadonlyMap<string, string>,
  items: readonly { dependencies?: readonly string[] }[],
): Record<string, string> => {
  const listed = new Set(items.flatMap((item) => item.dependencies ?? []))
  return Object.fromEntries([...ranges].filter(([name]) => listed.has(name)))
}
