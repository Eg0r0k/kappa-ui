const YEAR = 60 * 60 * 24 * 365

export const useDocsShell = () => {
  const cookie = useCookie<'open' | 'closed'>('kappa-docs-sidebar', {
    default: () => 'open',
    maxAge: YEAR,
    sameSite: 'lax',
  })
  const wide = useState('docs-sidebar-wide', () => cookie.value)
  const narrow = useState('docs-sidebar-narrow', () => false)
  const drawer = useState('docs-nav-drawer', () => false)

  watch(wide, (value) => {
    cookie.value = value
  })

  const toggle = () => {
    if (window.matchMedia('(min-width: 90rem)').matches) {
      wide.value = wide.value === 'open' ? 'closed' : 'open'
      return
    }
    if (window.matchMedia('(min-width: 64rem)').matches) {
      narrow.value = !narrow.value
      return
    }
    drawer.value = true
  }

  return { wide, narrow, drawer, toggle }
}
