export const consumerFilename = (path: string) =>
  path.replace(/^src\/(ui|examples)\//, '@/components/$1/').replace(/^src\//, '@/')

export const consumerSource = (source: string) => source.replace(/(["'])@\/(ui|examples)\//g, '$1@/components/$2/')

// ranges: listedRanges from scripts/lib/dependency-ranges.ts, through the runtime config. Every package gets its
// range, @lucide/vue included: the registry build leaves that one bare for the CLI, which a manual install skips.
export const consumerDependencies = (dependencies: readonly string[], ranges: Readonly<Record<string, string>>) =>
  dependencies.map((dependency) => {
    const range = ranges[dependency]
    if (range === undefined) {
      throw new Error(`"${dependency}" has no range: add it to the dependencies in packages/registry/package.json.`)
    }
    return `${dependency}@${range}`
  })
