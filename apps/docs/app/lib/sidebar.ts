import { categories, pageCategory } from '~/lib/categories'

export type NavNode = { title: string; path: string; children?: NavNode[]; [key: string]: unknown }
export type NavPage = { title: string; path: string; component?: string; category?: string; description?: string }
export type SidebarSection = 'guides' | 'components' | 'project'
export type SidebarGroup = { key: string; title: string; section: SidebarSection; pages: NavPage[] }
export type DocsSection = 'docs' | 'components'
export type Segment = { text: string; match: boolean }

export const COMPONENTS_PATH = '/docs/components'
export const CHANGELOG_PATH = '/docs/changelog'

const text = (value: unknown) => (typeof value === 'string' ? value : undefined)

const pagesOf = (node?: NavNode): NavPage[] =>
  (node?.children ?? []).map((child) => ({
    title: child.title,
    path: child.path,
    component: text(child.component),
    category: text(child.category),
    description: text(child.description),
  }))

export const sectionOf = (path: string): DocsSection =>
  path === COMPONENTS_PATH || path.startsWith(`${COMPONENTS_PATH}/`) ? 'components' : 'docs'

const guideGroups = (nav: readonly NavNode[]): SidebarGroup[] =>
  nav
    .filter((node) => node.path !== COMPONENTS_PATH)
    .map((node) => ({
      key: node.path.split('/').at(-1) ?? node.path,
      title: node.title,
      section: 'guides' as const,
      pages: pagesOf(node),
    }))

const categoryGroups = (nav: readonly NavNode[], guides: readonly SidebarGroup[]): SidebarGroup[] => {
  const pages = pagesOf(nav.find((node) => node.path === COMPONENTS_PATH))
  return categories
    .map((category) => ({
      key: category.key as string,
      title: category.title as string,
      section: 'components' as const,
      pages: [
        ...(guides.find((guide) => guide.key === category.key)?.pages ?? []),
        ...pages.filter((page) => pageCategory(page) === category.key),
      ],
    }))
    .filter((group) => group.pages.length > 0)
}

export const componentGroups = (nav: readonly NavNode[]) => categoryGroups(nav, [])

export const sidebarGroups = (nav: readonly NavNode[]): SidebarGroup[] => {
  const guides = guideGroups(nav)
  const keys = new Set<string>(categories.map((category) => category.key))
  return [
    ...guides.filter((guide) => !keys.has(guide.key)),
    ...categoryGroups(nav, guides),
    { key: 'project', title: 'Project', section: 'project', pages: [{ title: 'Changelog', path: CHANGELOG_PATH }] },
  ]
}

export const filterGroups = (groups: readonly SidebarGroup[], query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return groups as SidebarGroup[]
  return groups
    .map((group) => ({ ...group, pages: group.pages.filter((page) => page.title.toLowerCase().includes(needle)) }))
    .filter((group) => group.pages.length > 0)
}

export const highlight = (value: string, query: string): Segment[] => {
  const needle = query.trim().toLowerCase()
  if (!needle) return [{ text: value, match: false }]
  const haystack = value.toLowerCase()
  const segments: Segment[] = []
  let from = 0
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, from)) {
    if (at > from) segments.push({ text: value.slice(from, at), match: false })
    segments.push({ text: value.slice(at, at + needle.length), match: true })
    from = at + needle.length
  }
  if (from < value.length) segments.push({ text: value.slice(from), match: false })
  return segments
}

export const groupOf = (groups: readonly SidebarGroup[], path: string) =>
  groups.find((group) => group.pages.some((page) => page.path === path))?.key

export const modKey = (platform: string) => (/mac|iphone|ipad|ipod/i.test(platform) ? '⌘' : 'Ctrl')

export const neighbours = (groups: readonly SidebarGroup[], path: string): { previous?: NavPage; next?: NavPage } => {
  const pages = groups.flatMap((group) => group.pages)
  const at = pages.findIndex((page) => page.path === path)
  if (at === -1) return {}
  return { previous: pages[at - 1], next: pages[at + 1] }
}
