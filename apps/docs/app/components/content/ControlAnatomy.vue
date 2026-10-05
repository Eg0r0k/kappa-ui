<script setup lang="ts">
import { Mail } from '@lucide/vue'
import { computed, ref } from 'vue'

import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import DocsFigure from '~/components/DocsFigure.vue'

const scale = {
  xs: { height: 28, padding: 8, icon: 14, gap: 6, radius: '--radius-md' },
  sm: { height: 32, padding: 10, icon: 16, gap: 8, radius: '--radius-lg' },
  md: { height: 36, padding: 12, icon: 16, gap: 8, radius: '--radius-lg' },
  lg: { height: 40, padding: 12, icon: 20, gap: 10, radius: '--radius-lg' },
  xl: { height: 48, padding: 16, icon: 20, gap: 12, radius: '--radius-xl' },
} as const

type Size = keyof typeof scale

const sizes = Object.keys(scale) as Size[]
const size = ref<Size>('md')
const step = computed(() => scale[size.value])

const double = (part: 'height' | 'padding' | 'icon' | 'gap') => `calc(var(--control-${part}-${size.value}) * 2)`

const geometry = computed(() => ({
  height: double('height'),
  paddingInline: double('padding'),
  borderRadius: `calc(var(${step.value.radius}) * 2)`,
}))

const legend = computed(() => [
  { token: `--control-height-${size.value}`, value: step.value.height, dot: 'bg-foreground' },
  { token: `--control-padding-${size.value}`, value: step.value.padding, dot: 'bg-primary' },
  { token: `--control-icon-${size.value}`, value: step.value.icon, dot: 'bg-info' },
  { token: `--control-gap-${size.value}`, value: step.value.gap, dot: 'bg-warning' },
])

const choose = (value: unknown) => {
  if (typeof value === 'string' && value in scale) size.value = value as Size
}
</script>

<template>
  <DocsFigure title="One control, drawn at 2×">
    <template #actions>
      <ToggleGroup type="single" size="sm" aria-label="Size" :model-value="size" @update:model-value="choose">
        <ToggleGroupItem v-for="item in sizes" :key="item" :value="item">{{ item }}</ToggleGroupItem>
      </ToggleGroup>
    </template>
    <div class="flex justify-center overflow-x-auto px-6 py-10" aria-hidden="true">
      <div class="flex items-start gap-3">
        <div class="flex flex-col gap-2">
          <div class="relative flex items-center bg-background inset-ring inset-ring-border" :style="geometry">
            <span
              class="absolute inset-y-0 start-0 rounded-s-[inherit] bg-primary/15"
              :style="{ width: double('padding') }"
            />
            <span
              class="absolute inset-y-0 end-0 rounded-e-[inherit] bg-primary/15"
              :style="{ width: double('padding') }"
            />
            <Mail
              class="relative shrink-0 text-muted-foreground outline-1 outline-info outline-dashed"
              :style="{ width: double('icon'), height: double('icon') }"
            />
            <span class="self-stretch bg-warning/40" :style="{ width: double('gap') }" />
            <span class="relative leading-none" :style="{ fontSize: 'calc(var(--typescale-label-lg-size) * 2)' }"
              >Inbox</span
            >
          </div>
          <div class="flex font-mono text-xs">
            <span class="flex flex-col items-center gap-1 text-primary" :style="{ width: double('padding') }">
              <span class="h-1.5 w-full border-x border-b border-current" />{{ step.padding }}
            </span>
            <span class="flex flex-col items-center gap-1 text-info-text" :style="{ width: double('icon') }">
              <span class="h-1.5 w-full border-x border-b border-current" />{{ step.icon }}
            </span>
            <span class="flex flex-col items-center gap-1 text-warning-text" :style="{ width: double('gap') }">
              <span class="h-1.5 w-full border-x border-b border-current" />{{ step.gap }}
            </span>
            <span class="flex-1" />
            <span class="flex flex-col items-center gap-1 text-primary" :style="{ width: double('padding') }">
              <span class="h-1.5 w-full border-x border-b border-current" />{{ step.padding }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 font-mono text-xs" :style="{ height: double('height') }">
          <span class="h-full w-1.5 border-y border-e border-current" />{{ step.height }}
        </div>
      </div>
    </div>
    <ul class="flex flex-wrap justify-center gap-x-5 gap-y-1.5 border-t px-4 py-3 font-mono text-xs">
      <li v-for="item in legend" :key="item.token" class="flex items-center gap-1.5">
        <span :class="['size-2 rounded-full', item.dot]" />
        {{ item.token }}
        <span class="text-muted-foreground">{{ item.value }}px</span>
      </li>
    </ul>
  </DocsFigure>
</template>
