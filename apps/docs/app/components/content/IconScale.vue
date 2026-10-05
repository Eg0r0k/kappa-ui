<script setup lang="ts">
import { Check, Mail, Trash2 } from '@lucide/vue'

import { Button } from '@/ui/button'
import DocsFigure from '~/components/DocsFigure.vue'

const steps = [
  { size: 'xs', button: 'xs', icon: 14 },
  { size: 'sm', button: 'sm', icon: 16 },
  { size: 'md', button: 'default', icon: 16 },
  { size: 'lg', button: 'lg', icon: 20 },
  { size: 'xl', button: 'xl', icon: 20 },
] as const
</script>

<template>
  <DocsFigure title="Size and colour come from the component" class="divide-y">
    <div class="flex flex-wrap items-end justify-center gap-6 p-6 sm:p-8" inert>
      <div v-for="step in steps" :key="step.size" class="flex flex-col items-center gap-2">
        <Button :size="step.button" variant="soft" color="neutral"><Mail data-icon="inline-start" />Inbox</Button>
        <span class="font-mono text-xs text-muted-foreground">{{ step.size }} · {{ step.icon }}px</span>
      </div>
    </div>
    <div class="flex flex-col items-center gap-3 p-6">
      <div class="flex flex-wrap justify-center gap-3" inert>
        <Button variant="ghost" color="neutral"><Mail data-icon="inline-start" />Inbox</Button>
        <Button variant="ghost" color="destructive"><Trash2 data-icon="inline-start" />Delete</Button>
        <Button variant="soft" color="success"><Check data-icon="inline-start" />Done</Button>
      </div>
      <span class="font-mono text-xs text-muted-foreground">currentColor</span>
    </div>
  </DocsFigure>
</template>
