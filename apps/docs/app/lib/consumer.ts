const CORE_PACKAGE = '@kappa-ui/core'

export const consumerFilename = (path: string) =>
  path.replace(/^src\/(ui|examples)\//, '@/components/$1/').replace(/^src\//, '@/')

export const consumerSource = (source: string) => source.replace(/(["'])@\/(ui|examples)\//g, '$1@/components/$2/')

export const consumerDependencies = (dependencies: readonly string[], coreVersion: string) =>
  dependencies.map((dependency) => (dependency === CORE_PACKAGE ? `${CORE_PACKAGE}@^${coreVersion}` : dependency))
