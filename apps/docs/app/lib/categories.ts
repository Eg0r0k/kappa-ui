import { findItem, registryItems, type RegistryItem } from '~/lib/registry'

export const categories = [
  { key: 'actions', title: 'Actions' },
  { key: 'text-input', title: 'Text input' },
  { key: 'choice', title: 'Choice' },
  { key: 'forms', title: 'Forms' },
  { key: 'overlays', title: 'Overlays' },
  { key: 'navigation', title: 'Navigation' },
  { key: 'data-display', title: 'Data display' },
  { key: 'layout', title: 'Layout & scroll' },
  { key: 'feedback', title: 'Feedback' },
  { key: 'utilities', title: 'Utilities' },
] as const

export type CategoryKey = (typeof categories)[number]['key']

const isCategory = (value: string | undefined): value is CategoryKey =>
  categories.some((category) => category.key === value)

export const categoryOf = (item?: RegistryItem) => item?.categories?.find(isCategory)

export const pageCategory = (
  page: { category?: string; component?: string },
  items: readonly RegistryItem[] = registryItems,
) => {
  if (isCategory(page.category)) return page.category
  return page.component ? categoryOf(findItem(page.component, items)) : undefined
}
