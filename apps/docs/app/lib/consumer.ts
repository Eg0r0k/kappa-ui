export const consumerFilename = (path: string) =>
  path.replace(/^src\/(ui|examples)\//, '@/components/$1/').replace(/^src\//, '@/')

export const consumerSource = (source: string) => source.replace(/(["'])@\/(ui|examples)\//g, '$1@/components/$2/')

// ranges: from scripts/lib/dependency-ranges.ts, like the registry build's, through the runtime config
export const consumerDependencies = (dependencies: readonly string[], ranges: Readonly<Record<string, string>>) =>
  dependencies.map((dependency) => {
    const range = ranges[dependency]
    if (range === undefined) throw new Error(`"${dependency}" has no range in packages/registry/package.json.`)
    return `${dependency}@${range}`
  })
