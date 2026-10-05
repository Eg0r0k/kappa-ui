<script setup lang="ts">
import { Card } from '@/ui/card'
</script>

<template>
  <Card data-showcase-card variant="solid" size="sm" class="ring-1 ring-surface-border">
    <slot />
  </Card>
</template>
