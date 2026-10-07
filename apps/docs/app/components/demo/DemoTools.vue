<script setup lang="ts">
import { Moon, Palette, PilcrowLeft, RotateCcw, ScanSearch, Sun, SunMoon } from '@lucide/vue'

import { Menu, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/ui/menu'
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem } from '@/ui/toolbar'
import { vTooltip } from '@/ui/tooltip'
import { type Tone, tones } from '~/lib/preview-protocol'

const props = defineProps<{ colors: boolean }>()

const demo = injectDemo()
const { scheme, color, restart } = demo

const schemes = {
  site: { next: 'dark', label: 'Example theme: site' },
  dark: { next: 'light', label: 'Example theme: dark' },
  light: { next: 'site', label: 'Example theme: light' },
} as const

const swatches: Record<Tone, string> = {
  primary: 'bg-primary',
  neutral: 'bg-foreground',
  destructive: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
}

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
      <ToolbarToggleItem v-tooltip="'Inspect'" value="inspect" size="icon-sm" aria-label="Inspect">
        <ScanSearch />
      </ToolbarToggleItem>
      <ToolbarToggleItem v-tooltip="'Right to left'" value="rtl" size="icon-sm" aria-label="Right to left">
        <PilcrowLeft />
      </ToolbarToggleItem>
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
    <span v-if="props.colors" class="flex">
      <MenuTrigger as-child>
        <ToolbarButton v-tooltip="'Colour'" variant="soft" size="icon-sm" aria-label="Example colour">
          <Palette />
        </ToolbarButton>
      </MenuTrigger>
      <Menu size="sm" anchor="top middle" self="bottom middle">
        <MenuRadioGroup v-model="color">
          <MenuRadioItem v-for="tone in tones" :key="tone" :value="tone" class="capitalize">
            <span :class="['size-3 rounded-full', swatches[tone]]" aria-hidden="true" />
            {{ tone }}
          </MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    </span>
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
