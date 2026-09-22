export const useDocsNavigation = () => {
  const { data } = useAsyncData('docs-navigation', () => queryCollectionNavigation('docs'))
  return computed(() => data.value?.find((item) => item.path === '/docs')?.children ?? [])
}
