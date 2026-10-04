import type { PackageManager } from '~/lib/install'

export const usePackageManager = () =>
  useCookie<PackageManager>('kappa-docs-pm', { default: () => 'pnpm', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
