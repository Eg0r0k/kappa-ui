export const loadDocsNavigation = () =>
  useAsyncData('docs-navigation', () => queryCollectionNavigation('docs', ['component', 'category', 'description']))

export const useDocsNavigation = () => {
  const { data } = loadDocsNavigation()
  return computed(() => data.value?.find((item) => item.path === '/docs')?.children ?? [])
}
