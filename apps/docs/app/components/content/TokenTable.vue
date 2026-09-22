<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const pairs = [
  { bg: 'primary', fg: 'primary-foreground', role: 'Button default fill and label; link text; spinner' },
  { bg: 'accent', fg: 'accent-foreground', role: 'Hover fill for outline and ghost' },
  { bg: 'background', fg: 'foreground', role: 'Page and outline fill; inherited text colour' },
  { bg: 'secondary', fg: 'secondary-foreground', role: 'Button secondary' },
  { bg: 'destructive', fg: null, role: 'Button destructive fill (white label)' },
  { bg: 'muted', fg: 'muted-foreground', role: 'Subdued surfaces and text' },
  { bg: 'card', fg: 'card-foreground', role: 'Defined, not read by any component yet' },
  { bg: 'popover', fg: 'popover-foreground', role: 'Defined, not read by any component yet' },
  { bg: 'input', fg: null, role: 'Outline button border' },
  { bg: 'border', fg: null, role: 'Default border colour' },
  { bg: 'ring', fg: null, role: 'Focus ring, drawn at 50% opacity' },
] as const

const resolved = ref<Record<string, string>>({})
const colorMode = useColorMode()

const read = () => {
  const style = getComputedStyle(document.documentElement)
  const names = pairs.flatMap((pair) => (pair.fg ? [pair.bg, pair.fg] : [pair.bg]))
  resolved.value = Object.fromEntries(names.map((name) => [name, style.getPropertyValue(`--${name}`).trim()]))
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
      <p class="font-mono text-xs">--{{ pair.bg }} <span class="text-muted-foreground">{{ resolved[pair.bg] }}</span></p>
      <p v-if="pair.fg" class="font-mono text-xs">
        --{{ pair.fg }} <span class="text-muted-foreground">{{ resolved[pair.fg] }}</span>
      </p>
      <p class="mt-2 text-xs text-muted-foreground">{{ pair.role }}</p>
    </div>
  </div>
</template>
