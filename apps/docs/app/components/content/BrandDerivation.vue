<script setup lang="ts">
import { ArrowDown } from '@lucide/vue'

import { Button } from '@/ui/button'
import DocsFigure from '~/components/DocsFigure.vue'

const brands = ['oklch(0.9 0.15 95)', 'oklch(0.6 0.2 150)', 'oklch(0.35 0.12 25)', 'oklch(0.7 0.2 320)']
</script>

<template>
  <DocsFigure title="Hue and chroma in, lightness fixed" class="p-6 sm:p-8">
    <div class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4" inert>
      <div
        v-for="brand in brands"
        :key="brand"
        class="kappa-brand-sample flex flex-col items-center gap-2"
        :style="{ '--brand': brand }"
      >
        <span class="font-mono text-xs text-muted-foreground">--brand</span>
        <span class="h-10 w-full max-w-32 rounded-lg bg-(--brand) inset-ring inset-ring-foreground/10" />
        <span class="font-mono text-xs text-muted-foreground">{{ brand }}</span>
        <ArrowDown class="my-1 size-4 text-muted-foreground" />
        <span class="font-mono text-xs text-muted-foreground">--primary</span>
        <Button class="w-full max-w-32">Button</Button>
      </div>
    </div>
  </DocsFigure>
</template>

<style scoped>
@supports (color: oklch(from red l c h)) {
  .kappa-brand-sample {
    --primary: oklch(from var(--brand) 0.48 c h);
  }

  :global(.dark) .kappa-brand-sample {
    --primary: oklch(from color-mix(in oklch, var(--brand) 50%, oklch(0 0 none)) 0.78 c h);
    --primary-foreground: oklch(from color-mix(in oklch, var(--brand) 40%, oklch(0 0 none)) 0.25 c h);
  }
}
</style>
