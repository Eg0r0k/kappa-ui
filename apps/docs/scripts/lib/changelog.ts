export type ChangelogPackage = 'registry' | 'core'
export type Bump = 'major' | 'minor' | 'patch'
export type ChangelogEntry = { hash: string; url: string; bump: Bump; text: string }
export type ParsedRelease = { version: string; entries: ChangelogEntry[] }
export type Release = ParsedRelease & { package: ChangelogPackage; date: string }
export type ItemTokens = { name: string; main: string; tokens: string[] }
export type ItemChangelog = {
  badge?: { kind: 'new' | 'updated'; until: string }
  releases: {
    package: ChangelogPackage
    version: string
    date: string
    entries: { hash: string; url: string; text: string }[]
  }[]
}
export type ChangelogData = { releases: Release[]; items: Record<string, ItemChangelog> }

const RELEASE = /^## (\S+)\s*$/
const BUMP = /^### (Major|Minor|Patch) Changes\s*$/
const ENTRY = /^- \[`([0-9a-f]+)`\]\(([^)]+)\)(?: Thanks \[[^\]]*\]\([^)]*\)!)? - (.*)$/
const BADGE_DAYS = 30

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const parseChangelog = (markdown: string) => {
  const releases: ParsedRelease[] = []
  let bump: Bump = 'patch'
  let current: ChangelogEntry | undefined
  for (const line of markdown.split(/\r?\n/)) {
    const release = RELEASE.exec(line)
    if (release) {
      releases.push({ version: release[1]!, entries: [] })
      current = undefined
      continue
    }
    const heading = BUMP.exec(line)
    if (heading) {
      bump = heading[1]!.toLowerCase() as Bump
      current = undefined
      continue
    }
    const entry = ENTRY.exec(line)
    if (entry && releases.length > 0) {
      current = { hash: entry[1]!, url: entry[2]!, bump, text: entry[3]!.trim() }
      releases.at(-1)!.entries.push(current)
      continue
    }
    if (line.startsWith('- ')) {
      current = undefined
      continue
    }
    if (current && line.startsWith('  ')) current.text += `\n${line.trim()}`
  }
  for (const release of releases) {
    for (const item of release.entries) item.text = item.text.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '')
  }
  return releases
}

export const exportedNames = (source: string) => {
  const names = new Set<string>()
  for (const match of source.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}/g)) {
    for (const part of match[1]!.split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .at(-1)
        ?.trim()
      if (name && name !== 'default') names.add(name)
    }
  }
  for (const match of source.matchAll(/export\s+(?:const|let|function|class|type|interface)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]!)
  }
  return [...names]
}

export const pascalName = (name: string) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

export const mentions = (text: string, tokens: readonly string[]) =>
  tokens.some((token) => new RegExp(`(?<![\\w$])${escape(token)}(?![\\w$])`).test(text))

export const introduces = (text: string, main: string) => {
  const name = escape(main)
  return [
    new RegExp(`^(?:New|Add)(?: the)? \`?${name}\`?(?![\\w$])`),
    new RegExp(`^${name}: \`${name}\``),
    new RegExp(`^\`${name}\` is `),
  ].some((pattern) => pattern.test(text))
}

export const releaseDate = (git: (args: string[]) => string, file: string, version: string) => {
  const date = git(['log', '-S', `## ${version}`, '--format=%cI', '--reverse', '--', file])
    .split(/\r?\n/)
    .find(Boolean)
  if (!date) {
    throw new Error(
      `No commit adds "## ${version}" to ${file}. A shallow clone has no history; check out with fetch-depth: 0.`,
    )
  }
  return date
}

const addDays = (date: string, days: number) => new Date(new Date(date).getTime() + days * 86_400_000)

export const buildChangelog = (releases: readonly Release[], items: readonly ItemTokens[], now: Date) => {
  const ordered = [...releases].sort((a, b) => b.date.localeCompare(a.date))
  const result: Record<string, ItemChangelog> = {}
  for (const item of items) {
    const matching = ordered
      .map((release) => ({ release, entries: release.entries.filter((entry) => mentions(entry.text, item.tokens)) }))
      .filter((group) => group.entries.length > 0)
    const changelog: ItemChangelog = {
      releases: matching.map(({ release, entries }) => ({
        package: release.package,
        version: release.version,
        date: release.date,
        entries: entries.map(({ hash, url, text }) => ({ hash, url, text })),
      })),
    }
    const introduction = [...matching]
      .reverse()
      .find(({ entries }) => entries.some((entry) => entry.bump !== 'patch' && introduces(entry.text, item.main)))
    const latest = matching[0]
    const newUntil = introduction && addDays(introduction.release.date, BADGE_DAYS)
    const updatedUntil = latest && addDays(latest.release.date, BADGE_DAYS)
    if (newUntil && newUntil > now) changelog.badge = { kind: 'new', until: newUntil.toISOString() }
    else if (updatedUntil && updatedUntil > now) changelog.badge = { kind: 'updated', until: updatedUntil.toISOString() }
    result[item.name] = changelog
  }
  return { releases: ordered, items: result }
}
