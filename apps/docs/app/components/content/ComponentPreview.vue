<script setup lang="ts">
import { Maximize2, PanelRight } from '@lucide/vue'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import { vTooltip } from '@/ui/tooltip'
import ScrollBox from '~/components/ScrollBox.vue'
import { exampleSlug, pageSlugOf } from '~/lib/examples'
import { registryItems, resolveExample } from '~/lib/registry'
import { exampleModules } from '~/lib/sources'

const props = defineProps<{ name: string; height?: string; class?: HTMLAttributes['class'] }>()

const resolve = () => {
  try {
    return resolveExample(props.name, registryItems, Object.keys(exampleModules))
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: (error as Error).message, fatal: true })
  }
}

const { item, key } = resolve()
const Example = defineAsyncComponent(exampleModules[key]!)
const slug = exampleSlug(props.name, pageSlugOf(useRoute().path))

const demo = injectDemo(null)
const label = computed(() => demo?.examples.value.find((example) => example.name === props.name)?.title ?? item.title)
const current = computed(() => (demo?.open.value ?? false) && demo?.selected.value?.name === props.name)

const canvas = 'flex min-h-72 items-center-safe justify-center-safe p-10'
</script>

<template>
  <div :data-example="slug" class="not-prose my-6 scroll-mt-20 max-md:scroll-mt-30">
    <div data-slot="example" class="rounded-xl border bg-muted/40 p-1">
      <div class="mb-1 flex h-9 items-center gap-2 ps-2.5 pe-0.5">
        <span class="min-w-0 flex-1 truncate text-body-sm text-muted-foreground">{{ label }}</span>
        <div v-if="demo?.active.value" class="hidden items-center gap-0.5 md:flex">
          <Button
            v-tooltip="current ? 'Close the panel' : 'Open in panel'"
            :variant="current ? 'soft' : 'ghost'"
            :color="current ? 'primary' : 'neutral'"
            size="icon-sm"
            aria-label="Open in panel"
            :aria-pressed="current"
            @click="current ? demo.close() : demo.show(slug)"
          >
            <PanelRight />
          </Button>
          <Button
            v-tooltip="'Fullscreen'"
            variant="ghost"
            color="neutral"
            size="icon-sm"
            aria-label="Open fullscreen"
            @click="demo.show(slug, true)"
          >
            <Maximize2 />
          </Button>
        </div>
      </div>
      <div
        data-slot="example-canvas"
        :class="cn('overflow-hidden rounded-[max(0px,calc(var(--radius-xl)-0.25rem))] bg-card', props.class)"
      >
        <ScrollArea v-if="props.height" orientation="both" :style="{ height: props.height }">
          <div :class="cn(canvas, 'min-h-full')">
            <Example />
          </div>
        </ScrollArea>
        <ScrollBox v-else>
          <div :class="canvas">
            <Example />
          </div>
        </ScrollBox>
      </div>
    </div>
  </div>
</template>
