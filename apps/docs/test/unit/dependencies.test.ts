import { describe, expect, it } from 'vitest'

import { coreModules, dependencyLinks, rekaFamilies } from '~/lib/dependencies'

const dialog = `<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps } from "@kappa-ui/core/dialog";
import { useForwardPropsEmits } from "reka-ui";
</script>`

const toggleGroup = `<script setup lang="ts">
import {
  ToggleGroupRoot,
  type ToggleGroupRootEmits,
  useForwardPropsEmits,
} from "reka-ui";
import type { AcceptableValue } from "reka-ui";
</script>`

describe('rekaFamilies', () => {
  it('reads the Reka primitives a source builds on', () => {
    expect(rekaFamilies(toggleGroup)).toEqual(['ToggleGroup'])
    expect(rekaFamilies('import { Toggle, Primitive } from "reka-ui";')).toEqual(['Toggle'])
    expect(rekaFamilies('import { SplitterGroup, type SplitterGroupProps } from "reka-ui";')).toEqual(['Splitter'])
    expect(rekaFamilies(dialog)).toEqual([])
  })
})

describe('coreModules', () => {
  it('reads the core modules a source imports', () => {
    expect(coreModules(dialog)).toEqual(['dialog'])
    expect(
      coreModules('import { vRipple } from "@kappa-ui/core/ripple";\nimport x from "@kappa-ui/core/overlay";'),
    ).toEqual(['ripple', 'overlay'])
  })
})

describe('dependencyLinks', () => {
  it('links the Reka primitive and the core module, preferring the ones named like the item', () => {
    expect(dependencyLinks([toggleGroup], 'toggle-group')).toEqual([
      { label: 'Reka UI', href: 'https://reka-ui.com/docs/components/toggle-group' },
    ])
    expect(dependencyLinks(['import { vRipple } from "@kappa-ui/core/ripple";', dialog], 'dialog')).toEqual([
      { label: '@kappa-ui/core', href: 'https://github.com/Eg0r0k/kappa-ui/tree/main/packages/core/src/dialog' },
    ])
    expect(dependencyLinks(['import { cn } from "@/lib/utils";'], 'kbd')).toEqual([])
  })
})
