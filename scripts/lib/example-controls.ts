import { INHERIT_LINE, MARKER_ATTRIBUTE } from './example-props.ts'

export type ControlValue = string | boolean
export type ExampleControl = { prop: string; values: ControlValue[]; default: ControlValue }
export type ExampleControls = Record<string, { component: string; controls: ExampleControl[] }>
export type ControlEntry = string | { prop: string; values: string[] } | { attribute: string }
export type MetaProp = { name: string; default?: string; schema?: unknown }
export type ResolveInput = {
  items: readonly {
    name: string
    files: readonly { path: string }[]
    meta?: { demo?: { controls?: readonly ControlEntry[] } }
  }[]
  uiFiles: readonly string[]
  getMeta: (uiFile: string) => { props: readonly MetaProp[] }
  readSource: (path: string) => Promise<string>
}

const SIZE_ORDER = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'icon-xs', 'icon-sm', 'icon-md', 'icon-lg', 'icon-xl']

const MARKED_TAG = new RegExp(`<([A-Z][A-Za-z0-9]*)\\b[^>]*?\\s${MARKER_ATTRIBUTE.replace('$', '\\$')}`, 'g')

export const markedTags = (source: string) => [...source.matchAll(MARKED_TAG)].map((match) => match[1]!)

const literal = (member: string): ControlValue[] => {
  if (member === 'true') return [true]
  if (member === 'false') return [false]
  if (member.startsWith('"') && member.endsWith('"')) return [JSON.parse(member) as string]
  return []
}

export const propValues = (schema: unknown): ControlValue[] | undefined => {
  if (schema === 'boolean') return [false, true]
  if (typeof schema !== 'object' || schema === null) return undefined
  const { kind, schema: members } = schema as { kind?: unknown; schema?: unknown }
  if (kind !== 'enum' || typeof members !== 'object' || members === null) return undefined
  const values = Object.values(members)
    .filter((member): member is string => typeof member === 'string')
    .flatMap(literal)
  if (values.length === 0) return undefined
  if (values.every((value) => typeof value === 'boolean')) return [false, true]
  const sized = values.every((value) => typeof value === 'string' && SIZE_ORDER.includes(value))
  return sized ? [...values].sort((a, b) => SIZE_ORDER.indexOf(a as string) - SIZE_ORDER.indexOf(b as string)) : values
}

const parsedDefault = (raw: string | undefined): unknown => {
  if (raw === undefined) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

const controlOf = (
  example: string,
  component: string,
  props: readonly MetaProp[],
  entry: ControlEntry,
): { control?: ExampleControl; errors: string[] } => {
  if (typeof entry === 'object' && 'attribute' in entry) {
    return { control: { prop: entry.attribute, values: [false, true], default: false }, errors: [] }
  }
  const name = typeof entry === 'string' ? entry : entry.prop
  const prop = props.find((candidate) => candidate.name === name)
  if (!prop) return { errors: [`${example}: ${component} has no prop "${name}"`] }
  const values = propValues(prop.schema)
  if (!values) return { errors: [`${example}: ${component}.${name} is not enumerable or boolean`] }
  const narrowed: ControlValue[] = typeof entry === 'string' ? values : entry.values
  const unknown = narrowed.filter((value) => !values.includes(value))
  if (unknown.length > 0) {
    return { errors: unknown.map((value) => `${example}: ${component}.${name} has no value "${String(value)}"`) }
  }
  const declared = parsedDefault(prop.default)
  const fallback = values.includes(false) ? false : values[0]!
  const value = values.includes(declared as ControlValue) ? (declared as ControlValue) : fallback
  if (!narrowed.includes(value)) {
    return { errors: [`${example}: ${component}.${name} leaves out its default "${String(value)}"`] }
  }
  return { control: { prop: name, values: [...narrowed], default: value }, errors: [] }
}

export const resolveExampleControls = async (input: ResolveInput) => {
  const controls: ExampleControls = {}
  const errors: string[] = []
  for (const item of input.items) {
    const entries = item.meta?.demo?.controls
    if (!entries) continue
    const source = await input.readSource(item.files[0]!.path)
    const tags = markedTags(source)
    if (tags.length !== 1) {
      errors.push(`${item.name}: needs exactly one ${MARKER_ATTRIBUTE} marker, found ${tags.length}`)
      continue
    }
    if (!source.includes(INHERIT_LINE)) {
      errors.push(`${item.name}: a marked example needs ${INHERIT_LINE.replace(/;$/, '')}`)
      continue
    }
    const component = tags[0]!
    const uiFile = input.uiFiles.find((file) => file.endsWith(`/${component}.vue`))
    if (!uiFile) {
      errors.push(`${item.name}: <${component}> is not a registry component`)
      continue
    }
    const { props } = input.getMeta(uiFile)
    const resolved = entries.map((entry) => controlOf(item.name, component, props, entry))
    errors.push(...resolved.flatMap((result) => result.errors))
    controls[item.name] = {
      component,
      controls: resolved.flatMap((result) => (result.control ? [result.control] : [])),
    }
  }
  return { controls, errors }
}
