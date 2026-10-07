import type { ThumbPayload } from '../payload.ts'
import { idOf, pageNamed } from './shared.ts'

const PAINT_KEYS = ['fills', 'strokes'] as const

const hexOf = (index: number) => `#1337${index.toString(16).padStart(2, '0').toUpperCase()}`
const rgbOf = (index: number): RGB => ({ r: 0x13 / 255, g: 0x37 / 255, b: index / 255 })

const pathOf = (node: BaseNode, root: BaseNode) => {
  const names: string[] = []
  for (let current: BaseNode | null = node; current && current !== root; current = current.parent)
    names.unshift(current.name)
  return names.join(' > ')
}

const thumbnailsOf = (payload: ThumbPayload) => {
  const page = pageNamed('Mockups')
  const section = page.children.find(
    (node): node is SectionNode => node.type === 'SECTION' && node.name === 'thumbnails',
  )
  if (!section) throw new Error('The Mockups page has no thumbnails section')
  return section.children.filter(
    (node): node is FrameNode =>
      node.type === 'FRAME' &&
      idOf(node).startsWith('Thumbnail/') &&
      (!payload.only || payload.only.includes(node.name)),
  )
}

const post = async (payload: ThumbPayload, body: unknown) => {
  const response = await fetch(payload.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await response.text())
}

export const exportThumbnails = async (payload: ThumbPayload) => {
  await figma.loadAllPagesAsync()
  await pageNamed('Mockups').loadAsync()
  const variables = new Map((await figma.variables.getLocalVariablesAsync()).map((variable) => [variable.id, variable]))
  const collections = new Map(
    (await figma.variables.getLocalVariableCollectionsAsync()).map((collection) => [collection.id, collection.name]),
  )
  const exported: string[] = []
  for (const frame of thumbnailsOf(payload)) {
    const clone = frame.clone()
    const sentinels: Record<string, string> = {}
    const indices = new Map<string, number>()
    const sentinelOf = (variable: Variable) => {
      const known = indices.get(variable.name)
      if (known !== undefined) return known
      const index = indices.size + 1
      indices.set(variable.name, index)
      sentinels[hexOf(index)] = variable.name
      return index
    }
    try {
      for (const node of [clone, ...clone.findAll(() => true)]) {
        for (const key of PAINT_KEYS) {
          if (!(key in node)) continue
          const paints = (node as MinimalFillsMixin & MinimalStrokesMixin)[key]
          if (!Array.isArray(paints) || paints.length === 0) continue
          const replaced = paints.map((paint: Paint) => {
            if (paint.visible === false) return paint
            const variable = paint.type === 'SOLID' ? variables.get(paint.boundVariables?.color?.id ?? '') : undefined
            if (!variable) throw new Error(`${frame.name}: ${pathOf(node, clone)} has ${key} not bound to a variable`)
            if (collections.get(variable.variableCollectionId) !== 'Color') {
              throw new Error(
                `${frame.name}: ${pathOf(node, clone)} uses ${variable.name} outside the Color collection`,
              )
            }
            const index = sentinelOf(variable)
            const unbound = figma.variables.setBoundVariableForPaint(paint as SolidPaint, 'color', null)
            return { ...unbound, color: rgbOf(index), opacity: 1 }
          })
          ;(node as MinimalFillsMixin & MinimalStrokesMixin)[key] = replaced
        }
      }
      const svg = await clone.exportAsync({
        format: 'SVG_STRING',
        svgOutlineText: true,
        svgIdAttribute: false,
        svgSimplifyStroke: true,
      })
      await post(payload, { name: frame.name, svg, sentinels })
      exported.push(frame.name)
    } finally {
      clone.remove()
    }
  }
  await post(payload, { done: exported })
  return { exported: exported.length }
}
