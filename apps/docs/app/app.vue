<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title && title !== 'delta-ui' ? `${title} · delta-ui` : 'delta-ui'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
