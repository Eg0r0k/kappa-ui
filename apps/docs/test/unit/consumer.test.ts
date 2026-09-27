import { describe, expect, it } from 'vitest'

import { consumerDependencies, consumerFilename, consumerSource } from '~/lib/consumer'

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
  it('adds the published range to core and leaves other packages alone', () => {
    expect(consumerDependencies(['class-variance-authority', '@kappa-ui/core'], '0.1.0')).toEqual([
      'class-variance-authority',
      '@kappa-ui/core@^0.1.0',
    ])
  })
})
