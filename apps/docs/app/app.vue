<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'

import { fontOf, fontUrl, isDefaultTheme, siteCss } from '~/lib/theme'
import { Toaster } from '@/ui/toast'

const { theme } = useSiteTheme()

useHead({
  titleTemplate: (title) => (title && title !== 'delta-ui' ? `${title} · delta-ui` : 'delta-ui'),
  style: [{ key: 'site-theme', innerHTML: computed(() => (isDefaultTheme(theme.value) ? '' : siteCss(theme.value))) }],
  link: computed(() =>
    theme.value.font === 'inter'
      ? []
      : [{ key: 'site-font', rel: 'stylesheet', href: fontUrl([fontOf(theme.value).name]) }],
  ),
})
</script>

<template>
  <ConfigProvider :scroll-body="false">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </ConfigProvider>
</template>
