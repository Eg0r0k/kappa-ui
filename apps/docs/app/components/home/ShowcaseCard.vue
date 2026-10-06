<script setup lang="ts">
import { Card } from '@/ui/card'
</script>

<template>
  <Card
    data-showcase-card
    variant="solid"
    size="sm"
    class="break-inside-avoid ring-1 ring-surface-border sm:max-lg:mb-4"
  >
    <slot />
  </Card>
</template>
