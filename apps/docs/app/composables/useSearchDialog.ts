export const useSearchDialog = () => {
  const open = useState('search-open', () => false)
  const query = useState('search-query', () => '')
  const show = (initial = '') => {
    query.value = initial
    open.value = true
  }
  return { open, query, show }
}
