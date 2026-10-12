export type PropValue = string | boolean

export const MARKER_ATTRIBUTE = 'v-bind="$attrs"'
export const INHERIT_LINE = 'defineOptions({ inheritAttrs: false });'

const INHERIT = new RegExp(`^[ \\t]*${INHERIT_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \\t]*\\r?\\n`, 'm')

export const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

const attribute = (name: string, value: PropValue) => {
  if (value === true) return kebab(name)
  if (value === false) return `:${kebab(name)}="false"`
  return `${kebab(name)}="${value}"`
}

export const applyProps = (source: string, props: Readonly<Record<string, PropValue>> = {}) => {
  if (!source.includes(MARKER_ATTRIBUTE)) return source
  const attributes = Object.entries(props)
    .map(([name, value]) => ` ${attribute(name, value)}`)
    .join('')
  return source
    .replace(` ${MARKER_ATTRIBUTE}`, attributes)
    .replace(INHERIT, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(<\/script>)/, '\n$1')
}
