<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Link,
  Maximize2,
  Minimize2,
  Moon,
  Palette,
  RotateCcw,
  ScanSearch,
  Sun,
  SunMoon,
} from '@lucide/vue'

import { Menu, MenuItem, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/ui/menu'
import { useToast } from '@/ui/toast'
import { Toolbar, ToolbarButton, ToolbarToggleGroup, ToolbarToggleItem } from '@/ui/toolbar'
import { vTooltip } from '@/ui/tooltip'
import { type Tone, tones } from '~/lib/preview-protocol'

const props = defineProps<{ colors: boolean }>()

const demo = injectDemo()
const { examples, selected, index, previous, next, scheme, color, expanded, restart } = demo
const route = useRoute()
const toast = useToast()

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

const step = (example: { slug: string } | undefined) => {
  if (example) demo.select(example.slug)
}

const cycleScheme = () => {
  scheme.value = schemes[scheme.value].next
}

const copyLink = async () => {
  if (!selected.value) return
  await navigator.clipboard.writeText(`${window.location.origin}${route.path}#${selected.value.slug}`)
  toast.add({ title: 'Link copied', color: 'success' })
}
</script>

<template>
  <Toolbar
    variant="ghost"
    aria-label="Example"
    data-slot="demo-toolbar"
    class="min-h-12 w-full shrink-0 flex-wrap border-b px-2 py-1.5"
  >
    <ToolbarButton
      v-tooltip="'Previous example'"
      size="icon-sm"
      aria-label="Previous example"
      :disabled="!previous"
      @click="step(previous)"
    >
      <ChevronLeft />
    </ToolbarButton>
    <ToolbarButton
      v-tooltip="'Next example'"
      size="icon-sm"
      aria-label="Next example"
      :disabled="!next"
      @click="step(next)"
    >
      <ChevronRight />
    </ToolbarButton>
    <p class="flex min-w-36 flex-1 items-baseline gap-2 px-1 text-sm">
      <span data-slot="demo-title" class="truncate font-medium">{{ selected?.title }}</span>
      <span class="shrink-0 text-xs text-muted-foreground tabular-nums">{{ index + 1 }}/{{ examples.length }}</span>
    </p>
    <div class="ms-auto flex items-center gap-1">
      <ToolbarToggleGroup v-model="toggles" type="multiple" aria-label="Example view">
        <ToolbarToggleItem v-tooltip="'Inspect'" value="inspect" size="icon-sm" aria-label="Inspect">
          <ScanSearch />
        </ToolbarToggleItem>
        <ToolbarToggleItem v-tooltip="'Right to left'" value="rtl" size="sm" aria-label="Right to left">
          RTL
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarButton
        v-tooltip="schemes[scheme].label"
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
          <ToolbarButton v-tooltip="'Colour'" size="icon-sm" aria-label="Example colour">
            <Palette />
          </ToolbarButton>
        </MenuTrigger>
        <Menu size="sm" anchor="bottom end" self="top end">
          <MenuRadioGroup v-model="color">
            <MenuRadioItem v-for="tone in tones" :key="tone" :value="tone" class="capitalize">
              <span :class="['size-3 rounded-full', swatches[tone]]" aria-hidden="true" />
              {{ tone }}
            </MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      </span>
      <ToolbarButton v-tooltip="'Restart'" size="icon-sm" aria-label="Restart the example" @click="restart += 1">
        <RotateCcw />
      </ToolbarButton>
      <ToolbarButton
        v-tooltip="expanded ? 'Collapse' : 'Expand'"
        size="icon-sm"
        :aria-label="expanded ? 'Collapse the panel' : 'Expand the panel'"
        :aria-pressed="expanded"
        @click="expanded = !expanded"
      >
        <Minimize2 v-if="expanded" />
        <Maximize2 v-else />
      </ToolbarButton>
      <span class="flex">
        <MenuTrigger as-child>
          <ToolbarButton size="icon-sm" aria-label="More example actions">
            <Ellipsis />
          </ToolbarButton>
        </MenuTrigger>
        <Menu size="sm" anchor="bottom end" self="top end">
          <MenuItem @select="copyLink">
            <Link />
            Copy link
          </MenuItem>
        </Menu>
      </span>
    </div>
  </Toolbar>
</template>
