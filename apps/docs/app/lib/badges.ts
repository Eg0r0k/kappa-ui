import data from '~/generated/badges.json'

export type BadgeKind = 'new' | 'updated'

const badges = data as Record<string, { kind: BadgeKind; until: string }>

export const badgeOf = (component: string | undefined, now?: number): BadgeKind | undefined => {
  const badge = component ? badges[component] : undefined
  if (!badge) return undefined
  if (now !== undefined && Date.parse(badge.until) < now) return undefined
  return badge.kind
}
