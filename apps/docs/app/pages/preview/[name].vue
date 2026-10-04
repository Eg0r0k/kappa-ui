<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { ConfigProvider } from 'reka-ui'

import { ScrollArea } from '@/ui/scroll-area'

import ExampleBoundary from '~/components/ExampleBoundary.vue'
import PreviewInspect from '~/components/PreviewInspect.vue'
import { toneStyle } from '~/lib/demo'
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

const { dir, color, inspect, key, post } = usePreviewClient()
useHead({ htmlAttrs: { dir, style: computed(() => toneStyle(color.value)) } })

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
    <ScrollArea orientation="both" class="h-svh w-full">
      <div
        data-slot="preview-canvas"
        :class="[
          'flex min-h-svh w-full items-center-safe justify-center-safe',
          padded && 'p-10',
          inspect && 'bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[1rem_1rem]',
        ]"
      >
        <div ref="content" data-slot="preview-content" class="flex w-full justify-center">
          <ExampleBoundary :key="key" @error="(message) => post({ type: 'kappa:error', message })">
            <Example />
          </ExampleBoundary>
        </div>
      </div>
    </ScrollArea>
    <PreviewInspect v-if="inspect" />
  </ConfigProvider>
</template>
