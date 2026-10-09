<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'

import ScrollBox from '~/components/ScrollBox.vue'

const props = defineProps<{ command: string }>()

const { copied, copy } = useCopied(() => props.command)
</script>

<template>
  <button
    type="button"
    data-slot="command-line"
    :aria-label="copied ? 'Copied' : `Copy ${props.command}`"
    class="flex w-full items-center gap-2 rounded-lg border bg-card py-1.5 ps-4 pe-1.5 text-start outline-none transition-colors duration-short-2 ease-standard hover:bg-muted/60 focus-visible:focus-ring active:bg-muted motion-reduce:transition-none"
    @click="copy"
  >
    <span class="min-w-0 flex-1">
      <ScrollBox class="py-1.5">
        <code class="whitespace-nowrap font-mono text-sm">{{ props.command }}</code>
      </ScrollBox>
    </span>
    <span class="flex size-8 shrink-0 items-center justify-center text-muted-foreground icon-size-4" aria-hidden="true">
      <Check v-if="copied" />
      <Copy v-else />
    </span>
  </button>
</template>
