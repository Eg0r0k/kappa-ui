import { describe, expect, it } from 'vitest'

import { addCommand, installDependenciesCommand, registryItemUrl } from '~/lib/install'

describe('registryItemUrl', () => {
  it('joins the site URL and the item name', () => {
    expect(registryItemUrl('https://delta-ui.dev/', 'button')).toBe('https://delta-ui.dev/r/button.json')
  })
})

describe('addCommand', () => {
  const url = 'https://delta-ui.dev/r/button.json'

  it.each([
    ['pnpm', `pnpm dlx shadcn-vue@latest add ${url}`],
    ['npm', `npx shadcn-vue@latest add ${url}`],
    ['yarn', `yarn dlx shadcn-vue@latest add ${url}`],
    ['bun', `bunx --bun shadcn-vue@latest add ${url}`],
  ] as const)('builds the %s command', (pm, expected) => {
    expect(addCommand(pm, url)).toBe(expected)
  })
})

describe('installDependenciesCommand', () => {
  it.each([
    ['pnpm', 'pnpm add reka-ui clsx'],
    ['npm', 'npm install reka-ui clsx'],
    ['yarn', 'yarn add reka-ui clsx'],
    ['bun', 'bun add reka-ui clsx'],
  ] as const)('builds the %s command', (pm, expected) => {
    expect(installDependenciesCommand(pm, ['reka-ui', 'clsx'])).toBe(expected)
  })

  it('returns null when there is nothing to install', () => {
    expect(installDependenciesCommand('pnpm', [])).toBeNull()
  })
})
