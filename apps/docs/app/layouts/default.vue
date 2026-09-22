<script setup lang="ts">
import DocsHeader from '~/components/layout/DocsHeader.vue'
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <DocsHeader />
    <slot />
  </div>
</template>
