<script setup lang="ts">
useHead({ bodyAttrs: { class: 'bg-background text-foreground' } })
</script>

<template>
  <div data-slot="preview-root" class="min-h-svh bg-background text-foreground">
    <slot />
  </div>
</template>
