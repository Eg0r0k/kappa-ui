<script setup lang="ts">
useHead({
  htmlAttrs: { style: 'scrollbar-gutter: auto; overflow: hidden' },
  bodyAttrs: { class: 'bg-card text-foreground' },
})
</script>

<template>
  <div data-slot="preview-root" class="min-h-svh bg-card text-foreground">
    <slot />
  </div>
</template>
