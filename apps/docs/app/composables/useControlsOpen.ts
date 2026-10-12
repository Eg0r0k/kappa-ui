export const useControlsOpen = () => {
  const cookie = useCookie<'open' | 'closed'>('kappa-docs-controls', {
    default: () => 'open',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const open = useState('example-controls-open', () => cookie.value !== 'closed')
  return computed({
    get: () => open.value,
    set: (value: boolean) => {
      open.value = value
      cookie.value = value ? 'open' : 'closed'
    },
  })
}
