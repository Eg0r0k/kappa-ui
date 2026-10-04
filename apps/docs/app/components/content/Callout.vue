<script setup lang="ts">
import { Info, TriangleAlert } from '@lucide/vue'

import { Alert, AlertDescription } from '@/ui/alert'

const props = withDefaults(defineProps<{ type?: 'note' | 'warning' }>(), { type: 'note' })
</script>

<template>
  <Alert
    variant="subtle"
    :color="props.type === 'warning' ? 'warning' : 'info'"
    class="not-prose my-6 [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono"
  >
    <TriangleAlert v-if="props.type === 'warning'" />
    <Info v-else />
    <AlertDescription><slot /></AlertDescription>
  </Alert>
</template>
