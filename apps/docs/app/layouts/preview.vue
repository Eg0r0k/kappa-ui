<script setup lang="ts">
useHead({
  htmlAttrs: { style: 'scrollbar-gutter: auto' },
  bodyAttrs: { class: 'bg-background text-foreground' },
})
</script>

<template>
  <div data-slot="preview-root" class="min-h-svh bg-background text-foreground">
    <slot />
  </div>
</template>
