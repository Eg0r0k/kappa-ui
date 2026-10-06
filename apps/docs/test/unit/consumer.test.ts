import registryPackage from '#registry/package.json'
import { describe, expect, it } from 'vitest'

import { consumerDependencies, consumerFilename, consumerSource } from '~/lib/consumer'
import { registryItems } from '~/lib/registry'

import corePackage from '../../../../packages/core/package.json'
import { dependencyRanges } from '../../../../scripts/lib/dependency-ranges.ts'

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

  it('gives every package an item lists the range the registry build uses', () => {
    const published = dependencyRanges(corePackage, registryPackage)
    expect(published.get('@kappa-ui/core')).toBe(`^${corePackage.version}`)
    expect(published.get('reka-ui')).toBe(corePackage.peerDependencies['reka-ui'])
    const config = Object.fromEntries(published)
    for (const item of registryItems) {
      const dependencies = item.dependencies ?? []
      expect(consumerDependencies(dependencies, config), item.name).toEqual(
        dependencies.map((dependency) => `${dependency}@${published.get(dependency)}`),
      )
    }
  })
})
