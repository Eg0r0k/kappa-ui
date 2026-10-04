export type MetaSchema =
  string | { kind: string; type: string; schema?: MetaSchema[] | Record<string, MetaSchema | MetaProp> }
export type MetaProp = { name: string; type: string; required: boolean; default?: string; schema?: MetaSchema }
export type MetaMember = { name: string; type: string }
export type ComponentMetaInput = {
  props: MetaProp[]
  events: MetaMember[]
  slots: MetaMember[]
  exposed: MetaMember[]
}

export type PropDescription = string | { description: string; default?: string; fields?: Record<string, string> }
export type ApiDescriptions = {
  component: string
  file: string
  description?: string
  exposedType?: { file: string; name: string }
  props?: Record<string, PropDescription>
  emits?: Record<string, string>
  slots?: Record<string, string>
  exposed?: Record<string, string>
}

export type ApiRow = {
  name: string
  type: string
  description: string
  default?: string
  required?: boolean
  fields?: ApiRow[]
}
export type ComponentApi = {
  component: string
  description?: string
  props: ApiRow[]
  emits: ApiRow[]
  slots: ApiRow[]
  exposed: ApiRow[]
}

const stripUndefined = (type: string) => type.replace(/\s*\|\s*undefined$/, '')

const objectFields = (schema: MetaSchema | undefined): MetaProp[] | null => {
  if (schema === undefined || typeof schema === 'string' || schema.schema === undefined) return null
  if (schema.kind === 'object') return Object.values(schema.schema) as MetaProp[]
  if (schema.kind !== 'enum') return null
  for (const member of Object.values(schema.schema) as MetaSchema[]) {
    const fields = objectFields(member)
    if (fields) return fields
  }
  return null
}

const checkMembers = (
  component: string,
  kind: string,
  members: readonly { name: string }[],
  described: Record<string, unknown>,
  errors: string[],
) => {
  const names = new Set(members.map((member) => member.name))
  for (const member of members) {
    if (!(member.name in described)) errors.push(`${component}: ${kind} "${member.name}" has no description`)
  }
  for (const name of Object.keys(described)) {
    if (!names.has(name)) errors.push(`${component}: ${kind} "${name}" is described but does not exist`)
  }
}

const memberRows = (members: readonly MetaMember[], described: Record<string, string>): ApiRow[] =>
  members.flatMap((member) => {
    const description = described[member.name]
    return description === undefined ? [] : [{ name: member.name, type: member.type, description }]
  })

export const mergeApi = (meta: ComponentMetaInput, descriptions: ApiDescriptions) => {
  const { component } = descriptions
  const errors: string[] = []

  const eventHandlers = new Set(meta.events.map((event) => `on${event.name[0]?.toUpperCase()}${event.name.slice(1)}`))
  const props = meta.props.filter((prop) => !eventHandlers.has(prop.name))
  const propNames = new Set(props.map((prop) => prop.name))
  const exposed = meta.exposed.filter(
    (member) => !member.name.startsWith('$') && !propNames.has(member.name) && !eventHandlers.has(member.name),
  )

  const describedProps = descriptions.props ?? {}
  const describedEmits = descriptions.emits ?? {}
  const describedSlots = descriptions.slots ?? {}
  const describedExposed = descriptions.exposed ?? {}

  checkMembers(component, 'prop', props, describedProps, errors)
  checkMembers(component, 'emit', meta.events, describedEmits, errors)
  checkMembers(component, 'slot', meta.slots, describedSlots, errors)
  checkMembers(component, 'exposed', exposed, describedExposed, errors)

  const propRows = props.flatMap((prop): ApiRow[] => {
    const raw = describedProps[prop.name]
    if (raw === undefined) return []
    const entry = typeof raw === 'string' ? { description: raw } : raw

    if (entry.default !== undefined && prop.default !== undefined) {
      errors.push(
        `${component}: prop "${prop.name}" sets a default in its description, but the component already defines ${prop.default}`,
      )
    }

    const row: ApiRow = {
      name: prop.name,
      type: stripUndefined(prop.type),
      description: entry.description,
      default: prop.default ?? entry.default,
      required: prop.required,
    }
    if (row.default === undefined) delete row.default

    if (entry.fields) {
      const fields = objectFields(prop.schema)
      if (!fields) {
        errors.push(`${component}: prop "${prop.name}" describes fields, but its type has no object shape`)
      } else {
        const describedFields = entry.fields
        checkMembers(component, `prop "${prop.name}" field`, fields, describedFields, errors)
        row.fields = fields.flatMap((field) => {
          const description = describedFields[field.name]
          return description === undefined
            ? []
            : [{ name: field.name, type: stripUndefined(field.type), description, required: field.required }]
        })
      }
    }
    return [row]
  })

  const api: ComponentApi = {
    component,
    ...(descriptions.description ? { description: descriptions.description } : {}),
    props: propRows,
    emits: memberRows(meta.events, describedEmits),
    slots: memberRows(meta.slots, describedSlots),
    exposed: memberRows(exposed, describedExposed),
  }

  return { api, errors }
}
