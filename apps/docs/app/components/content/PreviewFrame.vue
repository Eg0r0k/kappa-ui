<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import { type HTMLAttributes, ref } from 'vue'

import { provideOverlayPortalTarget } from '@kappa-ui/core/overlay'
import { cn } from '@/lib/utils'

const props = defineProps<{
  theme?: 'light' | 'dark'
  dir: 'ltr' | 'rtl'
  class?: HTMLAttributes['class']
}>()

const portalTarget = ref<HTMLElement>()
provideOverlayPortalTarget(portalTarget)
</script>

<template>
  <div
    :dir="props.dir"
    :class="
      cn(
        'flex min-h-72 items-center justify-center rounded-lg border bg-background p-10 text-foreground',
        props.theme,
        props.class,
      )
    "
  >
    <ConfigProvider :dir="props.dir" :scroll-body="false">
      <div :key="props.dir" class="flex w-full justify-center">
        <slot />
      </div>
    </ConfigProvider>
    <div
      ref="portalTarget"
      data-slot="preview-portal"
      :dir="props.dir"
      :class="cn('contents text-foreground', props.theme)"
    />
  </div>
</template>
