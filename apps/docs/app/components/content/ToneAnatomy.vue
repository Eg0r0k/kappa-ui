<script setup lang="ts">
import { ref } from 'vue'

import { Button, type ButtonColor, type ButtonVariants } from '@/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import DocsFigure from '~/components/DocsFigure.vue'

type Read = { token: string; role: 'fill' | 'text' | 'edge'; swatch: string }

const tone: Read = { token: '--tone', role: 'fill', swatch: 'bg-tone' }
const toneForeground: Read = { token: '--tone-foreground', role: 'text', swatch: 'bg-tone-foreground' }
const toneText: Read = { token: '--tone-text', role: 'text', swatch: 'bg-tone-text' }
const toneSoft: Read = { token: '--tone-soft', role: 'fill', swatch: 'bg-tone-soft' }
const toneSoftForeground: Read = { token: '--tone-soft-foreground', role: 'text', swatch: 'bg-tone-soft-foreground' }
const toneBorder: Read = { token: '--tone-border', role: 'edge', swatch: 'bg-tone-border' }
const toneBorderSubtle: Read = { token: '--tone-border-subtle', role: 'edge', swatch: 'bg-tone-border-subtle' }

const variants: { name: NonNullable<ButtonVariants['variant']>; reads: Read[] }[] = [
  { name: 'solid', reads: [tone, toneForeground] },
  { name: 'soft', reads: [toneSoft, toneSoftForeground] },
  { name: 'subtle', reads: [toneSoft, toneSoftForeground, toneBorderSubtle] },
  { name: 'outline', reads: [toneText, toneBorder] },
  { name: 'ghost', reads: [toneText] },
  { name: 'link', reads: [toneText] },
]

const colors: ButtonColor[] = ['primary', 'neutral', 'destructive', 'success', 'warning', 'info']
const color = ref<ButtonColor>('primary')

const choose = (value: unknown) => {
  if (typeof value === 'string' && value) color.value = value as ButtonColor
}
</script>

<template>
  <DocsFigure title="What each variant reads">
    <div class="flex justify-center border-b p-3">
      <ToggleGroup
        type="single"
        size="sm"
        aria-label="Tone"
        class="flex-wrap justify-center"
        :model-value="color"
        @update:model-value="choose"
      >
        <ToggleGroupItem v-for="item in colors" :key="item" :value="item">{{ item }}</ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div data-slot="tone-anatomy" :data-color="color" class="divide-y" inert>
      <div
        v-for="variant in variants"
        :key="variant.name"
        class="flex flex-col gap-3 px-4 py-3 sm:grid sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-4"
      >
        <div class="flex items-center gap-3 sm:flex-col sm:gap-1.5">
          <Button :variant="variant.name" :color="color" size="sm">Button</Button>
          <span class="font-mono text-xs text-muted-foreground">{{ variant.name }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="read in variant.reads"
            :key="read.token"
            class="inline-flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap"
          >
            <span :class="['size-3 shrink-0 rounded-full inset-ring inset-ring-foreground/15', read.swatch]" />
            {{ read.token }}
            <span class="font-sans text-muted-foreground">{{ read.role }}</span>
          </span>
        </div>
      </div>
    </div>
  </DocsFigure>
</template>
