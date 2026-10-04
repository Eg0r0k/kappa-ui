<script setup lang="ts">
import { RotateCcw, TriangleAlert } from '@lucide/vue'
import { onErrorCaptured, ref } from 'vue'

import { Button } from '@/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty'

const emit = defineEmits<{ error: [message: string] }>()

const error = ref<string>()
const attempt = ref(0)

onErrorCaptured((cause) => {
  error.value = cause instanceof Error ? cause.message : String(cause)
  emit('error', error.value)
  return false
})

const retry = () => {
  error.value = undefined
  attempt.value += 1
}
</script>

<template>
  <Empty v-if="error">
    <EmptyHeader>
      <EmptyMedia>
        <TriangleAlert />
      </EmptyMedia>
      <EmptyTitle>The example stopped</EmptyTitle>
      <EmptyDescription>{{ error }}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" color="neutral" @click="retry">
        <RotateCcw data-icon="inline-start" />
        Restart
      </Button>
    </EmptyContent>
  </Empty>
  <div v-else :key="attempt" class="contents">
    <slot />
  </div>
</template>
