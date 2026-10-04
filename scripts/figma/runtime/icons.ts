import type { IconPayload } from '../payload.ts'
import {
  boardSection,
  byId,
  emptyReport,
  managedVariables,
  NAMESPACE,
  pageNamed,
  paintOf,
  required,
  stack,
  upsert,
} from './shared.ts'

const ICON = 24
const PER_ROW = 12
const GAP = 24
const PADDING = 48

const glyphOf = (svg: string) => {
  const frame = figma.createNodeFromSvg(svg)
  const outlined = frame.findAll().flatMap((node) => {
    if (!('outlineStroke' in node)) return []
    const outline = node.outlineStroke()
    return outline ? [outline] : []
  })
  if (outlined.length === 0) throw new Error('The icon has no strokes to outline')
  const glyph = figma.flatten([figma.union(outlined, frame)], frame)
  glyph.name = 'glyph'
  return { frame, glyph }
}

const iconGrid = (section: SectionNode, background: Variable) => {
  const found = section.children.find((node): node is FrameNode => node.type === 'FRAME' && node.name === 'icons')
  if (found) return found
  const grid = stack('icons', 'HORIZONTAL', GAP, PADDING)
  grid.layoutWrap = 'WRAP'
  grid.counterAxisSpacing = GAP
  grid.fills = [paintOf(background)]
  section.appendChild(grid)
  grid.primaryAxisSizingMode = 'FIXED'
  grid.resize(PER_ROW * ICON + (PER_ROW - 1) * GAP + 2 * PADDING, ICON + 2 * PADDING)
  grid.counterAxisSizingMode = 'AUTO'
  grid.x = 80
  grid.y = 80
  return grid
}

const createIcon = () => {
  const component = figma.createComponent()
  component.resize(ICON, ICON)
  component.fills = []
  component.clipsContent = false
  return component
}

export const syncIcons = async (payload: IconPayload) => {
  await figma.saveVersionHistoryAsync('kappa-ui icons sync')
  const report = emptyReport()
  await figma.loadAllPagesAsync()
  const page = pageNamed('Foundations')
  await page.loadAsync()
  const variables = await managedVariables()
  const foreground = required(variables, 'Color/foreground')
  const section = boardSection(page, 'Icons', { x: 1800, y: 0 }, report)
  const grid = iconGrid(section, required(variables, 'Color/background'))
  const managed = byId(grid.children.filter((node): node is ComponentNode => node.type === 'COMPONENT'))
  for (const icon of payload.icons) {
    if (managed.get(icon.id)?.getSharedPluginData(NAMESPACE, 'svg') === icon.svg) continue
    const component = upsert(managed, icon.id, createIcon, report)
    component.name = icon.name
    for (const child of [...component.children]) child.remove()
    const { frame, glyph } = glyphOf(icon.svg)
    component.appendChild(glyph)
    glyph.fills = [paintOf(foreground)]
    glyph.strokes = []
    glyph.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }
    frame.remove()
    component.setSharedPluginData(NAMESPACE, 'svg', icon.svg)
    grid.appendChild(component)
  }
  const kept = new Set(payload.icons.map((icon) => icon.id))
  for (const id of managed.keys()) if (!kept.has(id)) report.orphans.push(id)
  const sorted = grid.children.slice().sort((a, b) => a.name.localeCompare(b.name))
  for (const component of sorted) grid.appendChild(component)
  section.resizeWithoutConstraints(grid.width + 160, grid.height + 160)
  return report
}
