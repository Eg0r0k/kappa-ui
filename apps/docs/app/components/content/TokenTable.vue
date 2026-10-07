<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import ContrastBadge from '~/components/ContrastBadge.vue'
import type { ContrastCheck } from '~/lib/contrast'

const on = (fg: string, bg: string, min = 4.5): ContrastCheck => ({ label: `on --${bg}`, fg, bg, min })

const pairs = [
  { bg: 'brand', fg: null, role: 'Seed colour; --primary and --ring take its hue and chroma', checks: [] },
  {
    bg: 'primary',
    fg: 'primary-foreground',
    role: 'Brand fill and label; brand-coloured text on the page',
    checks: [on('primary-foreground', 'primary'), on('primary', 'background')],
  },
  {
    bg: 'background',
    fg: 'foreground',
    role: 'Page and outline fill; inherited text colour; disabled colour',
    checks: [on('foreground', 'background')],
  },
  {
    bg: 'secondary',
    fg: 'secondary-foreground',
    role: 'Soft neutral fill',
    checks: [on('secondary-foreground', 'secondary')],
  },
  {
    bg: 'destructive',
    fg: 'destructive-foreground',
    role: 'Destructive actions and errors',
    checks: [on('destructive-foreground', 'destructive'), on('destructive', 'background')],
  },
  {
    bg: 'success',
    fg: 'success-foreground',
    role: 'Fill for confirming actions and success states',
    checks: [on('success-foreground', 'success')],
  },
  {
    bg: 'success-text',
    fg: null,
    role: 'Success-coloured text, borders and tints on the page',
    checks: [on('success-text', 'background')],
  },
  {
    bg: 'warning',
    fg: 'warning-foreground',
    role: 'Fill for actions and states that need care',
    checks: [on('warning-foreground', 'warning')],
  },
  {
    bg: 'warning-text',
    fg: null,
    role: 'Warning-coloured text, borders and tints on the page',
    checks: [on('warning-text', 'background')],
  },
  { bg: 'info', fg: 'info-foreground', role: 'Fill for notices and tips', checks: [on('info-foreground', 'info')] },
  {
    bg: 'info-text',
    fg: null,
    role: 'Info-coloured text, borders and tints on the page',
    checks: [on('info-text', 'background')],
  },
  {
    bg: 'muted',
    fg: 'muted-foreground',
    role: 'Subdued surfaces and text',
    checks: [on('muted-foreground', 'muted'), on('muted-foreground', 'background')],
  },
  {
    bg: 'accent',
    fg: 'accent-foreground',
    role: 'Highlighted surfaces; not read by any component',
    checks: [on('accent-foreground', 'accent')],
  },
  { bg: 'card', fg: 'card-foreground', role: 'Card surface and text', checks: [on('card-foreground', 'card')] },
  {
    bg: 'dialog',
    fg: 'dialog-foreground',
    role: 'Dialogs, alert dialogs and drawers',
    checks: [on('dialog-foreground', 'dialog')],
  },
  {
    bg: 'popover',
    fg: 'popover-foreground',
    role: 'Menus, select lists, popovers, hover cards and toasts; a step above dialogs in the dark theme',
    checks: [on('popover-foreground', 'popover')],
  },
  { bg: 'input', fg: null, role: 'Borders of controls; 3:1 against the page', checks: [on('input', 'background', 3)] },
  { bg: 'border', fg: null, role: 'Decorative borders and dividers', checks: [] },
  { bg: 'ring', fg: null, role: 'Focus ring, drawn at 50% opacity', checks: [] },
] as const

const resolved = ref<Record<string, string>>({})
const colorMode = useColorMode()
const scope = useTemplateRef<HTMLElement>('scope')

const contrast = useContrast(
  scope,
  pairs.flatMap((pair) => pair.checks),
)
const rows = computed(() =>
  pairs.map((pair) => ({
    ...pair,
    results: contrast.value.filter((result) =>
      pair.checks.some((check: ContrastCheck) => check.fg === result.fg && check.bg === result.bg),
    ),
  })),
)

const read = () => {
  const probe = document.createElement('span')
  probe.hidden = true
  document.body.append(probe)
  const names = pairs.flatMap((pair) => (pair.fg ? [pair.bg, pair.fg] : [pair.bg]))
  resolved.value = Object.fromEntries(
    names.map((name) => {
      probe.style.color = `var(--${name})`
      return [name, getComputedStyle(probe).color]
    }),
  )
  probe.remove()
}

onMounted(read)
watch(
  () => colorMode.value,
  () => nextTick(read),
)
</script>

<template>
  <div ref="scope" class="not-prose my-6 grid gap-4 sm:grid-cols-2">
    <div v-for="pair in rows" :key="pair.bg" class="rounded-lg border p-3">
      <div
        class="mb-3 flex h-16 items-center justify-center rounded-md border text-sm font-medium"
        :style="{ background: `var(--${pair.bg})`, color: pair.fg ? `var(--${pair.fg})` : undefined }"
      >
        <span v-if="pair.fg">Aa</span>
      </div>
      <p class="font-mono text-xs">
        --{{ pair.bg }} <span class="text-muted-foreground">{{ resolved[pair.bg] }}</span>
      </p>
      <p v-if="pair.fg" class="font-mono text-xs">
        --{{ pair.fg }} <span class="text-muted-foreground">{{ resolved[pair.fg] }}</span>
      </p>
      <p class="mt-2 text-xs text-muted-foreground">{{ pair.role }}</p>
      <ul v-if="pair.results.length" class="mt-2 flex flex-col gap-1">
        <li v-for="result in pair.results" :key="`${result.fg}/${result.bg}`" class="flex items-center gap-2 text-xs">
          <ContrastBadge :ratio="result.ratio" :grade="result.grade" :min="result.min" />
          <span class="font-mono text-muted-foreground">--{{ result.fg }} {{ result.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
