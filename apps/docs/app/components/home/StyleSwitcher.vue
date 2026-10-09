<script setup lang="ts">
import { nextTick } from 'vue'

import { type ShowcaseStyle, type ShowcaseStyleKey, showcaseFontStack, showcaseStyles } from '~/lib/showcase-styles'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'

const model = defineModel<ShowcaseStyleKey>({ required: true })

const preload = (style: ShowcaseStyle) =>
  style.font
    ? Promise.all([400, 500, 600].map((weight) => document.fonts.load(`${weight} 1em "${style.font}"`))).catch(() => [])
    : Promise.resolve([])

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const select = async (key: unknown) => {
  const style = showcaseStyles.find((entry) => entry.key === key)
  if (!style || style.key === model.value) return
  await Promise.race([preload(style), wait(300)])
  const apply = () => {
    model.value = style.key
  }
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
  document.startViewTransition(async () => {
    apply()
    await nextTick()
  })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
    <span aria-hidden="true" class="text-label-lg text-muted-foreground">Your UI:</span>
    <ToggleGroup
      type="single"
      :model-value="model"
      aria-label="Showcase style"
      class="flex-wrap gap-1 [--button-group-radius:--theme(--radius-control-md)]"
      @update:model-value="select"
    >
      <ToggleGroupItem
        v-for="style in showcaseStyles"
        :key="style.key"
        :value="style.key"
        size="sm"
        @pointerenter="preload(style)"
        @focus="preload(style)"
      >
        <span class="size-2.5 shrink-0 rounded-full" :style="{ background: style.swatch }" />
        <span :style="{ fontFamily: showcaseFontStack(style) }">{{ style.name }}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
</template>
