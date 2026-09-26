export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const
export type PackageManager = (typeof packageManagers)[number]

export const registryItemUrl = (siteUrl: string, name: string) => `${siteUrl.replace(/\/+$/, '')}/r/${name}.json`

const runners: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx',
  npm: 'npx',
  yarn: 'yarn dlx',
  bun: 'bunx --bun',
}

const installers: Record<PackageManager, string> = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
  bun: 'bun add',
}

export const addCommand = (pm: PackageManager, url: string) => `${runners[pm]} shadcn-vue@latest add ${url}`

export const installDependenciesCommand = (pm: PackageManager, dependencies: readonly string[]) =>
  dependencies.length === 0 ? null : `${installers[pm]} ${dependencies.join(' ')}`
