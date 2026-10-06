import registryPackage from '#registry/package.json'
import { describe, expect, it } from 'vitest'

import { consumerDependencies, consumerFilename, consumerSource } from '~/lib/consumer'
import { registryItems } from '~/lib/registry'

import corePackage from '../../../../packages/core/package.json'
import {
  CLI_MANAGED_PACKAGES,
  dependencyRanges,
  listedRanges,
  publishedDependency,
} from '../../../../scripts/lib/dependency-ranges.ts'

describe('consumerFilename', () => {
  it.each([
    ['src/ui/button/Button.vue', '@/components/ui/button/Button.vue'],
    ['src/lib/utils.ts', '@/lib/utils.ts'],
    ['src/examples/badge/BadgeDemo.vue', '@/components/examples/badge/BadgeDemo.vue'],
  ])('places %s where the CLI puts it', (path, expected) => {
    expect(consumerFilename(path)).toBe(expected)
  })
})

describe('consumerSource', () => {
  it("rewrites registry imports to the consumer's aliases", () => {
    const source = [
      'import { Button } from "@/ui/button";',
      "import { cn } from '@/lib/utils'",
      'import Demo from "@/examples/badge/BadgeDemo.vue";',
      'import { vRipple } from "@kappa-ui/core/ripple";',
    ].join('\n')
    expect(consumerSource(source)).toBe(
      [
        'import { Button } from "@/components/ui/button";',
        "import { cn } from '@/lib/utils'",
        'import Demo from "@/components/examples/badge/BadgeDemo.vue";',
        'import { vRipple } from "@kappa-ui/core/ripple";',
      ].join('\n'),
    )
  })
})

describe('consumerDependencies', () => {
  const ranges = { 'class-variance-authority': '^0.7.1', '@kappa-ui/core': '^0.1.0', 'reka-ui': '^2.10.5' }

  it('writes every package with its range', () => {
    expect(consumerDependencies(['class-variance-authority', '@kappa-ui/core', 'reka-ui'], ranges)).toEqual([
      'class-variance-authority@^0.7.1',
      '@kappa-ui/core@^0.1.0',
      'reka-ui@^2.10.5',
    ])
  })

  it('throws on a package without a range instead of showing it bare', () => {
    expect(() => consumerDependencies(['left-pad'], ranges)).toThrow(/"left-pad" has no range/)
  })
})

describe('the ranges the Manual tab shows', () => {
  const ranges = dependencyRanges(corePackage, registryPackage)
  // what nuxt.config.ts puts in the runtime config
  const shown = listedRanges(ranges, registryItems)
  const listed = new Set(registryItems.flatMap((item) => item.dependencies ?? []))

  it('cover exactly the packages items list, so no tooling range reaches the pages', () => {
    expect(new Set(Object.keys(shown))).toEqual(listed)
    expect(registryPackage.devDependencies).toHaveProperty('vite')
    expect(shown).not.toHaveProperty('vite')
  })

  it("install core at its version, reka-ui in core's peer range and the rest as the registry depends on them", () => {
    const { '@kappa-ui/core': core, 'reka-ui': reka, ...rest } = shown
    expect(core).toBe(`^${corePackage.version}`)
    expect(reka).toBe(corePackage.peerDependencies['reka-ui'])
    const dependencies: Record<string, string> = registryPackage.dependencies
    for (const [name, range] of Object.entries(rest)) expect(range, name).toBe(dependencies[name])
  })

  it('match what the registry build publishes for every package it stamps', () => {
    for (const item of registryItems) {
      const stamped = (item.dependencies ?? []).filter((name) => !CLI_MANAGED_PACKAGES.has(name))
      expect(consumerDependencies(stamped, shown), item.name).toEqual(
        stamped.map((name) => publishedDependency(name, ranges)),
      )
    }
  })

  it('give @lucide/vue its range, though the build publishes it bare for the CLI', () => {
    expect(listed).toContain('@lucide/vue')
    expect(publishedDependency('@lucide/vue', ranges)).toBe('@lucide/vue')
    expect(consumerDependencies(['@lucide/vue'], shown)).toEqual([
      `@lucide/vue@${registryPackage.dependencies['@lucide/vue']}`,
    ])
  })
})
