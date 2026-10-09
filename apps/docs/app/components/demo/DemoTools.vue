<script setup lang="ts">
import { Moon, PilcrowLeft, RotateCcw, ScanSearch, Sun, SunMoon } from '@lucide/vue'

import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem } from '@/ui/toolbar'
import { Tooltip, TooltipContent, TooltipTrigger, vTooltip } from '@/ui/tooltip'

const demo = injectDemo()
const { scheme, restart } = demo

const schemes = {
  site: { next: 'dark', label: 'Example theme: site' },
  dark: { next: 'light', label: 'Example theme: dark' },
  light: { next: 'site', label: 'Example theme: light' },
} as const

const toggles = computed({
  get: () => [demo.inspect.value ? 'inspect' : '', demo.dir.value === 'rtl' ? 'rtl' : ''].filter(Boolean),
  set: (values: string[]) => {
    demo.inspect.value = values.includes('inspect')
    demo.dir.value = values.includes('rtl') ? 'rtl' : 'ltr'
  },
})

const cycleScheme = () => {
  scheme.value = schemes[scheme.value].next
}
</script>

<template>
  <Toolbar aria-label="Example tools" data-slot="demo-tools" class="bg-card shadow-shadow-lg">
    <ToolbarToggleGroup
      v-model="toggles"
      type="multiple"
      variant="soft"
      active-color="primary"
      aria-label="Example view"
    >
      <Tooltip>
        <TooltipTrigger as-child>
          <ToolbarToggleItem value="inspect" size="icon-sm" aria-label="Inspect">
            <ScanSearch />
          </ToolbarToggleItem>
        </TooltipTrigger>
        <TooltipContent>Inspect</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <ToolbarToggleItem value="rtl" size="icon-sm" aria-label="Right to left">
            <PilcrowLeft />
          </ToolbarToggleItem>
        </TooltipTrigger>
        <TooltipContent>Right to left</TooltipContent>
      </Tooltip>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarButton
      v-tooltip="schemes[scheme].label"
      variant="soft"
      size="icon-sm"
      :aria-label="schemes[scheme].label"
      :data-scheme="scheme"
      @click="cycleScheme"
    >
      <SunMoon v-if="scheme === 'site'" />
      <Moon v-else-if="scheme === 'dark'" />
      <Sun v-else />
    </ToolbarButton>
    <ToolbarButton
      v-tooltip="'Restart'"
      variant="soft"
      size="icon-sm"
      aria-label="Restart the example"
      @click="restart += 1"
    >
      <RotateCcw />
    </ToolbarButton>
  </Toolbar>
</template>
