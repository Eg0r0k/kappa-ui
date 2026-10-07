<script setup lang="ts">
import DocsHeader from '~/components/layout/DocsHeader.vue'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'
import NavDrawer from '~/components/layout/NavDrawer.vue'
import OnThisPage from '~/components/layout/OnThisPage.vue'
import OnThisPageRail from '~/components/layout/OnThisPageRail.vue'
import type { Component } from 'vue'

import { pageSlugOf } from '~/lib/examples'
import { outlineOf } from '~/lib/outline'

const route = useRoute()
const { wide, narrow } = useDocsShell()
const [{ data: page }] = await Promise.all([useDocsPage(() => route.path.replace(/\/+$/, '')), loadDocsNavigation()])
const outline = computed(() => outlineOf(page.value))
const activeHeading = useScrollSpy(() => outline.value?.headings.map((heading) => heading.id) ?? [])

const { active, open, expanded, width } = provideDemo({
  examples: () => page.value?.examples ?? [],
  pageSlug: () => pageSlugOf(route.path),
  component: () => page.value?.component,
})

// The panel opens once its chunk is in, so it unfolds in the same frame as the rail folds away.
const DemoPanel = shallowRef<Component>()
const loadDemoPanel = async () => {
  DemoPanel.value ??= (await import('~/components/demo/DemoPanel.vue')).default
}
onMounted(() => watch(active, (value) => value && loadDemoPanel(), { immediate: true }))
const panelOpen = computed(() => active.value && open.value && DemoPanel.value !== undefined)
const fullscreen = computed(() => panelOpen.value && expanded.value)

// The text column leaves the page while the panel is fullscreen; it comes back whole, where the reader was.
let scrollBack = 0
const returning = ref(false)
watch(fullscreen, (value) => {
  if (value) {
    scrollBack = window.scrollY
    return
  }
  returning.value = true
  nextTick(() => {
    window.scrollTo({ top: scrollBack })
    returning.value = false
  })
})
</script>

<template>
  <div
    data-slot="docs-shell"
    :data-sidebar-wide="wide"
    :data-sidebar-narrow="narrow ? 'open' : 'closed'"
    :style="{ '--demo-width': `${width}px` }"
    class="min-h-svh bg-background text-foreground"
  >
    <DocsHeader />
    <div class="flex">
      <aside
        aria-label="Navigation"
        class="invisible sticky top-14 hidden h-[calc(100svh-3.5rem)] w-0 shrink-0 overflow-hidden bg-card transition-[width,visibility] duration-medium-2 ease-standard motion-reduce:transition-none lg:block lg:in-data-[sidebar-narrow=open]:visible lg:in-data-[sidebar-narrow=open]:w-65 lg:in-data-[sidebar-narrow=open]:border-e wide:invisible wide:w-0 wide:border-e-0 wide:in-data-[sidebar-wide=open]:visible wide:in-data-[sidebar-wide=open]:w-65 wide:in-data-[sidebar-wide=open]:border-e"
      >
        <DocsSidebar class="w-65" />
      </aside>
      <main :class="['min-w-0 flex-1', panelOpen && 'md:min-w-80', fullscreen && 'hidden']">
        <OnThisPage :outline="outline" />
        <slot />
      </main>
      <Transition
        :css="!returning"
        enter-active-class="transition-[width] duration-medium-2 ease-standard motion-reduce:transition-none"
        enter-from-class="w-0!"
        leave-active-class="transition-[width] duration-medium-2 ease-standard motion-reduce:transition-none"
        leave-to-class="w-0!"
      >
        <div
          v-if="outline?.headings.length"
          v-show="!panelOpen"
          data-slot="on-this-page-column"
          class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-hidden xl:block"
        >
          <div class="h-full w-56 overflow-y-auto py-10 pe-6">
            <OnThisPageRail :outline="outline" :active="activeHeading" />
          </div>
        </div>
      </Transition>
      <Transition
        enter-active-class="overflow-hidden transition-[width,min-width] duration-medium-2 ease-standard motion-reduce:transition-none"
        enter-from-class="w-0! min-w-0!"
        leave-active-class="overflow-hidden transition-[width,min-width] duration-medium-2 ease-standard motion-reduce:transition-none data-expanded:hidden"
        leave-to-class="w-0! min-w-0!"
      >
        <component :is="DemoPanel" v-if="panelOpen" />
      </Transition>
    </div>
    <NavDrawer />
  </div>
</template>
