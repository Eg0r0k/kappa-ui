import type { ThumbExport } from './payload.ts'

const TAG = /<(\/?)([a-zA-Z][\w-]*)((?:\s[^<>]*?)?)(\/?)>/g
const ATTRIBUTE = /\s([\w:-]+)="([^"]*)"/g
const COLOR_ATTRIBUTES: Record<string, string> = { fill: 'fill', stroke: 'stroke', 'stop-color': 'stop-color' }
const CSS_NAME = /^[a-z][a-z0-9-]*$/

const attributesOf = (source: string) =>
  [...source.matchAll(ATTRIBUTE)].map(([, key, value]) => [key, value] as [string, string])

export const thumbnailSvg = ({ name, svg, sentinels }: ThumbExport) => {
  const lookup = new Map(Object.entries(sentinels).map(([hex, variable]) => [hex.toUpperCase(), variable]))
  const variableOf = (attribute: string, value: string) => {
    const variable = lookup.get(value.toUpperCase())
    if (!variable) throw new Error(`${name}: ${attribute} ${value} is not bound to a Color variable`)
    if (!CSS_NAME.test(variable)) throw new Error(`${name}: ${variable} has no CSS variable`)
    return `var(--${variable})`
  }
  const ids = new Map<string, string>()
  const idOf = (original: string) => {
    if (!ids.has(original)) ids.set(original, `${name}-${ids.size + 1}`)
    return ids.get(original)
  }
  let clipDepth = 0
  return svg.replace(TAG, (_tag, closing: string, tag: string, source: string, selfClosing: string) => {
    if (closing) {
      if (tag === 'clipPath') clipDepth--
      return `</${tag}>`
    }
    const kept: string[] = []
    const styles: string[] = []
    for (const [key, value] of attributesOf(source)) {
      if (tag === 'svg' && (key === 'width' || key === 'height')) continue
      if (key === 'id') {
        kept.push(`id="${idOf(value)}"`)
        continue
      }
      if (key === 'style') {
        styles.unshift(value)
        continue
      }
      const property = COLOR_ATTRIBUTES[key]
      if (!property || value === 'none') {
        kept.push(`${key}="${value.replace(/url\(#([^)]+)\)/g, (_url, id: string) => `url(#${idOf(id)})`)}"`)
        continue
      }
      if (clipDepth > 0) continue
      styles.push(`${property}:${variableOf(key, value)}`)
    }
    if (tag === 'clipPath' && !selfClosing) clipDepth++
    const style = styles.length ? ` style="${styles.join(';')}"` : ''
    const attributes = kept.length ? ` ${kept.join(' ')}` : ''
    return `<${tag}${attributes}${style}${selfClosing}>`
  })
}
