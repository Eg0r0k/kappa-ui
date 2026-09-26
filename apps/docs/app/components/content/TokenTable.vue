<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const pairs = [
  { bg: 'brand', fg: null, role: 'Seed colour; --primary and --ring take its hue and chroma' },
  { bg: 'primary', fg: 'primary-foreground', role: 'Brand fill and label; brand-coloured text on the page' },
  { bg: 'background', fg: 'foreground', role: 'Page and outline fill; inherited text colour; disabled colour' },
  { bg: 'secondary', fg: 'secondary-foreground', role: 'Soft neutral fill' },
  { bg: 'destructive', fg: 'destructive-foreground', role: 'Destructive actions and errors' },
  { bg: 'success', fg: 'success-foreground', role: 'Fill for confirming actions and success states' },
  { bg: 'success-text', fg: null, role: 'Success-coloured text, borders and tints on the page' },
  { bg: 'warning', fg: 'warning-foreground', role: 'Fill for actions and states that need care' },
  { bg: 'warning-text', fg: null, role: 'Warning-coloured text, borders and tints on the page' },
  { bg: 'muted', fg: 'muted-foreground', role: 'Subdued surfaces and text' },
  { bg: 'accent', fg: 'accent-foreground', role: 'Highlighted surfaces; not read by any component' },
  { bg: 'card', fg: 'card-foreground', role: 'Card surface and text' },
  { bg: 'popover', fg: 'popover-foreground', role: 'Not read by any component yet' },
  { bg: 'input', fg: null, role: 'Borders of controls; 3:1 against the page' },
  { bg: 'border', fg: null, role: 'Decorative borders and dividers' },
  { bg: 'ring', fg: null, role: 'Focus ring, drawn at 50% opacity' },
] as const

const resolved = ref<Record<string, string>>({})
const colorMode = useColorMode()

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
  <div class="not-prose my-6 grid gap-4 sm:grid-cols-2">
    <div v-for="pair in pairs" :key="pair.bg" class="rounded-lg border p-3">
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
    </div>
  </div>
</template>
