// Adapted from nuxt-component-meta (https://github.com/nuxt-modules/components-meta), copyright (c) NuxtLabs,
// MIT licence: https://github.com/nuxt-modules/components-meta/blob/main/LICENSE
import type { ComponentMeta, PropertyMeta } from 'vue-component-meta'

export type RefinedMeta = Pick<ComponentMeta, 'type' | 'props' | 'slots' | 'exposed' | 'events'>

type Loose = Record<string, any>

const nativeBrowserTypes = new Set([
  'HTMLElement',
  'HTMLCanvasElement',
  'HTMLDivElement',
  'HTMLSpanElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'HTMLFormElement',
  'HTMLImageElement',
  'HTMLAnchorElement',
  'HTMLLinkElement',
  'HTMLScriptElement',
  'HTMLStyleElement',
  'HTMLTableElement',
  'HTMLIFrameElement',
  'HTMLVideoElement',
  'HTMLAudioElement',
  'HTMLSelectElement',
  'HTMLOptionElement',
  'HTMLTextAreaElement',
  'HTMLLabelElement',
  'HTMLSlotElement',
  'Element',
  'Document',
  'Window',
  'Node',
  'NodeList',
  'HTMLCollection',
  'DOMTokenList',
  'NamedNodeMap',
  'DocumentFragment',
  'ShadowRoot',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'FocusEvent',
  'InputEvent',
  'EventTarget',
  'EventListener',
  'CanvasRenderingContext2D',
  'WebGLRenderingContext',
  'WebGL2RenderingContext',
  'ImageBitmap',
  'OffscreenCanvas',
  'MediaStream',
  'MediaStreamTrack',
  'MediaRecorder',
  'Storage',
  'SessionStorage',
  'LocalStorage',
  'DOMStringMap',
  'Buffer',
  'Process',
  'Stream',
])

const mentionsMdn = (description: unknown) =>
  typeof description === 'string' &&
  (description.includes('MDN Reference') ||
    description.includes('[MDN') ||
    description.includes('developer.mozilla.org'))

const looksNative = (node: Loose) => {
  if (node.kind === 'object' && typeof node.type === 'string' && nativeBrowserTypes.has(node.type)) return true
  const keys = Object.keys(node.schema)
  if (keys.length <= 50) return false
  const sample = keys.slice(0, 10)
  const mdn = sample.filter((key) => mentionsMdn(node.schema[key]?.description)).length
  return mdn > sample.length / 2
}

const isObject = (value: unknown) => typeof value === 'object' && value !== null && !Array.isArray(value)

const strip = (node: Loose): Loose => {
  if (!node) return node
  if (isObject(node.schema) && node.schema.kind === 'object' && nativeBrowserTypes.has(node.schema.type)) {
    return { ...node, schema: node.schema.type }
  }
  if (node.kind === 'object' && isObject(node.schema) && looksNative(node)) {
    return { ...node, schema: node.schema.type || 'object' }
  }
  if (Array.isArray(node)) return node.map(strip)
  if (Array.isArray(node.schema)) return { ...node, schema: node.schema.map(strip) }
  if (!node.schema || typeof node.schema !== 'object') return node
  const schema: Loose = {}
  for (const key of Object.keys(node.schema)) {
    if (key === 'schema' && node.schema[key]) {
      schema[key] = {}
      for (const member of Object.keys(node.schema[key])) schema[key][member] = strip(node.schema[key][member])
      continue
    }
    schema[key] = strip(node.schema[key])
  }
  return { ...node, schema }
}

const removeDeclarations = (node: unknown) => {
  if (typeof node !== 'object' || node === null) return
  const record = node as Loose
  for (const key of Object.keys(record)) {
    if (key === 'declarations') delete record[key]
    else removeDeclarations(record[key])
  }
}

const requiredFirstBooleansLast = (a: PropertyMeta, b: PropertyMeta) => {
  if (!a.required && b.required) return 1
  if (a.required && !b.required) return -1
  if (a.type === 'boolean' && b.type !== 'boolean') return 1
  if (a.type !== 'boolean' && b.type === 'boolean') return -1
  return 0
}

const handlerName = (event: string) => `on${event.charAt(0).toUpperCase()}${event.slice(1)}`

export const refineMeta = (meta: ComponentMeta): RefinedMeta => {
  const handlers = new Set(meta.events.map((event) => handlerName(event.name)))
  const refined = {
    type: meta.type,
    props: meta.props
      .filter((prop) => !prop.global && !handlers.has(prop.name))
      .sort(requiredFirstBooleansLast)
      .map(strip),
    slots: meta.slots.map(strip),
    exposed: meta.exposed.map(strip),
    events: meta.events.map(strip),
  }
  removeDeclarations(refined)
  return JSON.parse(JSON.stringify(refined)) as RefinedMeta
}
