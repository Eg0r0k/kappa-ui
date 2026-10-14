<script setup lang="ts">
import { Maximize2, Search, X } from '@lucide/vue'
import { useEventListener, useScrollLock } from '@vueuse/core'
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, shallowRef, useTemplateRef } from 'vue'

import { Button } from '@/ui/button'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/ui/command'
import ComponentCanvas from '~/components/home/canvas/ComponentCanvas.vue'
import DescriptionPanel from '~/components/home/canvas/DescriptionPanel.vue'
import ScrollBox from '~/components/ScrollBox.vue'
import { type CanvasComponent, canvasComponents } from '~/lib/canvas'
import { registryItems, resolveExample } from '~/lib/registry'
import { exampleModules } from '~/lib/sources'

const components = canvasComponents()
const keys = Object.keys(exampleModules)
const loaders = new Map(
  components.map((component) => [
    component.slug,
    defineAsyncComponent(exampleModules[resolveExample(component.example, registryItems, keys).key]!),
  ]),
)
const load = (component: CanvasComponent) => loaders.get(component.slug)!
const count = `${components.length} components`
const alphabetical = [...components].sort((a, b) => a.title.localeCompare(b.title))

const canvas = useTemplateRef<InstanceType<typeof ComponentCanvas>>('canvas')
const exploreButton = useTemplateRef<InstanceType<typeof Button>>('explore')
const openId = shallowRef<string | null>(null)
const fullscreen = shallowRef(false)
const finding = shallowRef(false)
// The phone keyboard is up: the description steps aside so it doesn't cover the field.
const keyboardOpen = shallowRef(false)
const openComponent = computed(() => components.find((component) => component.slug === openId.value))

const bodyLocked = useScrollLock(typeof document === 'undefined' ? null : document.body)

// iOS zooms the whole page into any field whose text is under 16px, and the kit's fields are 14px.
// Fullscreen, the canvas is one app screen with its own zoom, so the page stays at 1 until it closes.
const viewportMeta = () => document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
let viewportContent: string | undefined

const enter = async () => {
  fullscreen.value = true
  bodyLocked.value = true
  const meta = viewportMeta()
  if (meta && !meta.content.includes('maximum-scale')) {
    viewportContent = meta.content
    meta.content = `${meta.content}, maximum-scale=1`
  }
  await nextTick()
  canvas.value?.focus()
}

const exit = async () => {
  fullscreen.value = false
  bodyLocked.value = false
  const meta = viewportMeta()
  if (meta && viewportContent !== undefined) meta.content = viewportContent
  viewportContent = undefined
  await nextTick()
  exploreButton.value?.$el.focus()
}

const exploreCard = async (slug: string) => {
  await enter()
  canvas.value?.open(slug)
}

const jump = (slug: string) => {
  finding.value = false
  canvas.value?.open(slug)
}

// Escape leaves focus mode, then fullscreen. A menu or dialog opened inside a card closes first:
// listening in the capture phase sees it while it is still open.
const OVERLAY =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [data-reka-popper-content-wrapper]'
useEventListener(
  typeof window === 'undefined' ? null : window,
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector(OVERLAY)) return
    if (openId.value) openId.value = null
    else if (fullscreen.value) exit()
  },
  { capture: true },
)

onBeforeUnmount(() => {
  if (fullscreen.value) exit()
})
</script>

<template>
  <div
    data-slot="canvas-stage"
    :data-fullscreen="fullscreen || undefined"
    :class="fullscreen ? 'fixed inset-0 z-50 bg-background text-foreground' : 'relative size-full'"
  >
    <ComponentCanvas
      ref="canvas"
      v-model:open="openId"
      :components="components"
      :load="load"
      :count="count"
      :mode="fullscreen ? 'fullscreen' : 'inline'"
      :class="fullscreen ? undefined : 'lg:mask-l-from-[calc(100%-3rem)]'"
      @explore="exploreCard"
      @keyboard="keyboardOpen = $event"
    />

    <!-- The HUD lets drags through everywhere except its own controls. -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-end gap-3 p-4 md:p-6">
      <Transition
        enter-active-class="transition duration-medium-2 ease-emphasized-decelerate motion-reduce:transition-none"
        enter-from-class="-translate-y-2 opacity-0"
        leave-active-class="transition duration-short-3 ease-standard motion-reduce:transition-none"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <DescriptionPanel
          v-if="openComponent && !keyboardOpen"
          :component="openComponent"
          class="me-auto min-w-0 flex-1 sm:w-96 sm:flex-none"
          @close="openId = null"
        />
      </Transition>
      <div class="pointer-events-auto flex shrink-0 items-center gap-2">
        <Button variant="soft" color="neutral" data-canvas-find aria-label="Find a component" @click="finding = true">
          <Search data-icon="inline-start" />
          Find
        </Button>
        <Button v-if="fullscreen" variant="soft" color="neutral" @click="exit">
          <X data-icon="inline-start" />
          Close
        </Button>
        <Button v-else ref="explore" variant="soft" color="neutral" @click="enter">
          <Maximize2 data-icon="inline-start" />
          Explore
        </Button>
      </div>
    </div>

    <CommandDialog
      v-model:open="finding"
      title="Find a component"
      description="Type a component's name, then press Enter."
    >
      <CommandInput placeholder="Component name" />
      <ScrollBox :max-height="384">
        <CommandList class="max-h-none overflow-visible">
          <CommandEmpty>No such component.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="component in alphabetical"
              :key="component.slug"
              :value="component.title"
              @select="jump(component.slug)"
            >
              {{ component.title }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </ScrollBox>
    </CommandDialog>
  </div>
</template>
