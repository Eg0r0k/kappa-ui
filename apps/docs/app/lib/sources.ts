import type { Component } from 'vue'

import { matchModuleKey } from '~/lib/registry'

export const exampleModules = import.meta.glob<{ default: Component }>('@/examples/**/*.vue')

const rawSources = import.meta.glob<string>('@/**/*.{vue,ts}', { query: '?raw', import: 'default' })

export const loadSource = async (path: string) => {
  const key = matchModuleKey(path, Object.keys(rawSources))
  const load = key ? rawSources[key] : undefined
  if (!load) throw new Error(`Source ${path} was not found under packages/registry/src.`)
  return load()
}
