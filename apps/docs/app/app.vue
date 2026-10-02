<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'

import { fontOf, fontUrl, isDefaultTheme, siteCss } from '~/lib/theme'
import { DialogHost } from '@/ui/dialog'
import { Toaster } from '@/ui/toast'
import { TooltipProvider } from '@/ui/tooltip'

const { theme } = useSiteTheme()

useHead({
  titleTemplate: (title) => (title && title !== 'kappa-ui' ? `${title} · kappa-ui` : 'kappa-ui'),
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
    <TooltipProvider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <DialogHost />
    </TooltipProvider>
    <Toaster />
  </ConfigProvider>
</template>
