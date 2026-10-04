<script setup lang="ts">
import { RotateCcw, TriangleAlert } from '@lucide/vue'
import { useResizeObserver } from '@vueuse/core'
import { ConfigProvider } from 'reka-ui'

import { Button } from '@/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty'
import { registryItems, resolveExample } from '~/lib/registry'
import { exampleModules } from '~/lib/sources'

definePageMeta({ layout: 'preview' })

const route = useRoute()
const name = String(route.params.name)

const resolve = () => {
  try {
    return resolveExample(name, registryItems, Object.keys(exampleModules))
  } catch {
    return undefined
  }
}
const resolved = resolve()
if (!resolved) throw createError({ statusCode: 404, statusMessage: `No example named "${name}".`, fatal: true })

const Example = defineAsyncComponent(exampleModules[resolved.key]!)
const padded = resolved.item.meta?.demo?.padding !== false

useSeoMeta({ title: resolved.item.title, robots: 'noindex' })

const { dir, key, error, fail, retry, post } = usePreviewClient()
useHead({ htmlAttrs: { dir } })

onErrorCaptured((cause) => {
  fail(cause instanceof Error ? cause.message : String(cause))
  return false
})

const content = ref<HTMLElement>()
useResizeObserver(content, () => {
  const element = content.value
  if (!element?.parentElement) return
  const style = getComputedStyle(element.parentElement)
  const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  post({ type: 'kappa:size', height: Math.ceil(element.offsetHeight + padding) })
})
</script>

<template>
  <ConfigProvider :dir="dir">
    <div
      data-slot="preview-canvas"
      :class="['flex min-h-svh w-full items-center-safe justify-center-safe', padded && 'p-10']"
    >
      <div ref="content" data-slot="preview-content" class="flex w-full justify-center">
        <Empty v-if="error">
          <EmptyHeader>
            <EmptyMedia>
              <TriangleAlert />
            </EmptyMedia>
            <EmptyTitle>The example stopped</EmptyTitle>
            <EmptyDescription>{{ error }}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" color="neutral" @click="retry">
              <RotateCcw data-icon="inline-start" />
              Restart
            </Button>
          </EmptyContent>
        </Empty>
        <Example v-else :key="key" />
      </div>
    </div>
  </ConfigProvider>
</template>
