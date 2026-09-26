<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { onBeforeUnmount, ref } from 'vue'

import { Button } from '@/ui/button'

const props = defineProps<{ value: string }>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const copy = async () => {
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
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
