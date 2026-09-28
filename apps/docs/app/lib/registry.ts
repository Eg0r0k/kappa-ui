import manifest from '#registry/registry.json'

import { consumerFilename } from '~/lib/consumer'

export type RegistryFile = { path: string; type: string; target?: string }
export type CssRules = { [key: string]: string | CssRules }
export type CssVars = {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

export type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
  css?: CssRules
  cssVars?: CssVars
  cssSource?: string
  docs?: string
}

export const registryItems: readonly RegistryItem[] = (manifest as { items: RegistryItem[] }).items

export const findItem = (name: string, items: readonly RegistryItem[] = registryItems) =>
  items.find((item) => item.name === name)

export const isExample = (item: RegistryItem) => item.categories?.includes('example') ?? false

export const resolveInstallFilename = (file: RegistryFile) => file.target ?? consumerFilename(file.path)

export const matchModuleKey = (path: string, keys: readonly string[]) => {
  const suffix = path.replace(/^src\//, '/')
  return keys.find((key) => key.endsWith(suffix))
}

export const resolveExample = (name: string, items: readonly RegistryItem[], keys: readonly string[]) => {
  const item = findItem(name, items)
  if (!item) throw new Error(`Example "${name}" is not in packages/registry/registry.json.`)
  if (!isExample(item)) {
    throw new Error(`Registry item "${name}" is not an example (its categories must include "example").`)
  }
  const path = item.files[0]?.path ?? ''
  const key = matchModuleKey(path, keys)
  if (!key) {
    throw new Error(`Example "${name}" lists ${path}, which was not found under packages/registry/src.`)
  }
  return { item, key }
}
