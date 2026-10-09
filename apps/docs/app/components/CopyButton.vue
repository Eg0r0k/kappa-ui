<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'

import { Button } from '@/ui/button'

const props = defineProps<{ value: string }>()
const emit = defineEmits<{ copied: [] }>()

const { copied, copy: write } = useCopied(() => props.value)

const copy = async () => {
  await write()
  emit('copied')
}
</script>

<template>
  <Button
    variant="ghost"
    color="neutral"
    size="icon-sm"
    :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
    @click="copy"
  >
    <Check v-if="copied" />
    <Copy v-else />
  </Button>
</template>
