import type { SyncReport } from '../payload.ts'

type Marked = {
  getSharedPluginData(namespace: string, key: string): string
  setSharedPluginData(namespace: string, key: string, value: string): void
}

export const NAMESPACE = 'kappa_ui'

const PAGES = ['Foundations', 'Components', 'Mockups']
const CORNERS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] as const

export const idOf = (node: Marked) => node.getSharedPluginData(NAMESPACE, 'id')

export const mark = <T extends Marked>(node: T, id: string) => {
  node.setSharedPluginData(NAMESPACE, 'id', id)
  return node
}

export const byId = <T extends Marked>(items: readonly T[]) =>
  new Map(items.filter((item) => idOf(item) !== '').map((item) => [idOf(item), item]))

export const required = <T>(items: Map<string, T>, id: string) => {
  const item = items.get(id)
  if (item === undefined) throw new Error(`${id} is missing: run the tokens sync first`)
  return item
}

export const emptyReport = (): SyncReport => ({ created: [], updated: 0, orphans: [], removed: [] })

export const upsert = <T extends Marked>(managed: Map<string, T>, id: string, create: () => T, report: SyncReport) => {
  const found = managed.get(id)
  if (found) {
    report.updated++
    return found
  }
  report.created.push(id)
  return mark(create(), id)
}

export const settle = <T extends Marked & { remove(): void }>(
  managed: Map<string, T>,
  kept: Set<string>,
  prune: boolean,
  report: SyncReport,
) => {
  for (const [id, item] of managed) {
    if (kept.has(id)) continue
    if (!prune) {
      report.orphans.push(id)
      continue
    }
    item.remove()
    report.removed.push(id)
  }
}

export const sequence = async <T, R>(items: readonly T[], map: (item: T) => Promise<R> | R) => {
  const results: R[] = []
  for (const item of items) results.push(await map(item))
  return results
}

export const managedVariables = async () => byId(await figma.variables.getLocalVariablesAsync())

export const managedTextStyles = async () => byId(await figma.getLocalTextStylesAsync())

export const paintOf = (variable: Variable) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable)

export const bindRadius = (node: RectangleNode | FrameNode | ComponentNode, variable: Variable) => {
  for (const corner of CORNERS) node.setBoundVariable(corner, variable)
}

export const loadFonts = (styles: TextStyle[]) =>
  Promise.all(
    [{ family: 'Inter', style: 'Regular' }, ...styles.map((style) => style.fontName)].map((font) =>
      figma.loadFontAsync(font),
    ),
  )

export const textOf = async (characters: string, style: TextStyle, color: Variable) => {
  const text = figma.createText()
  await text.setTextStyleIdAsync(style.id)
  text.characters = characters
  text.fills = [paintOf(color)]
  return text
}

export const stack = (name: string, direction: 'HORIZONTAL' | 'VERTICAL', gap: number, padding = 0) => {
  const frame = figma.createFrame()
  frame.name = name
  frame.layoutMode = direction
  frame.itemSpacing = gap
  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = padding
  frame.primaryAxisSizingMode = 'AUTO'
  frame.counterAxisSizingMode = 'AUTO'
  frame.fills = []
  return frame
}

const findPage = (name: string) => {
  const marked = figma.root.children.find((page) => idOf(page) === `Page/${name}`)
  if (marked) return marked
  const named = figma.root.children.find((page) => idOf(page) === '' && page.name === name)
  if (named) return named
  return figma.root.children.find((page) => idOf(page) === '' && page.name === 'Page 1' && page.children.length === 0)
}

export const ensurePages = async (report: SyncReport) => {
  await figma.loadAllPagesAsync()
  for (const [index, name] of PAGES.entries()) {
    const found = findPage(name)
    const page = mark(found ?? figma.createPage(), `Page/${name}`)
    if (!found) report.created.push(`Page/${name}`)
    page.name = name
    figma.root.insertChild(index, page)
  }
  return pageNamed('Foundations')
}

export const pageNamed = (name: string) => {
  const page = figma.root.children.find((child) => idOf(child) === `Page/${name}`)
  if (!page) throw new Error(`Page ${name} is missing: run the tokens sync first`)
  return page
}

export const boardSection = (page: PageNode, name: string, origin: { x: number; y: number }, report: SyncReport) => {
  const found = page.children.find(
    (node): node is SectionNode => node.type === 'SECTION' && idOf(node) === `Board/${name}`,
  )
  if (found) return found
  const section = mark(figma.createSection(), `Board/${name}`)
  section.name = name
  page.appendChild(section)
  section.x = origin.x
  section.y = origin.y
  report.created.push(`Board/${name}`)
  return section
}
