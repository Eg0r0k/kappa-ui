<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'

useHead({
  titleTemplate: (title) => (title && title !== 'delta-ui' ? `${title} · delta-ui` : 'delta-ui'),
})
</script>

<template>
  <ConfigProvider :scroll-body="false">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ConfigProvider>
</template>
