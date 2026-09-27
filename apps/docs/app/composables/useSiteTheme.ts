import { type ThemeConfig, themeFromQuery, themeToQuery } from '~/lib/theme'

export const useSiteTheme = () => {
  const cookie = useCookie<Record<string, string>>('kappa-theme', {
    default: () => ({}),
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const theme = computed<ThemeConfig>(() => themeFromQuery(cookie.value ?? {}))

  const set = (next: ThemeConfig) => {
    cookie.value = themeToQuery(next)
  }

  const reset = () => {
    cookie.value = {}
  }

  return { theme, set, reset }
}
