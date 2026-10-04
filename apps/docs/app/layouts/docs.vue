<script setup lang="ts">
import DocsHeader from '~/components/layout/DocsHeader.vue'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'
import NavDrawer from '~/components/layout/NavDrawer.vue'
import OnThisPage from '~/components/layout/OnThisPage.vue'
import { pageSlugOf } from '~/lib/examples'
import { outlineOf } from '~/lib/outline'

const DemoPanel = defineAsyncComponent(() => import('~/components/demo/DemoPanel.vue'))

const route = useRoute()
const { wide, narrow } = useDocsShell()
const [{ data: page }] = await Promise.all([useDocsPage(() => route.path.replace(/\/+$/, '')), loadDocsNavigation()])
const outline = computed(() => outlineOf(page.value))

const { active, expanded, width } = provideDemo({
  examples: () => page.value?.examples ?? [],
  pageSlug: () => pageSlugOf(route.path),
  component: () => page.value?.component,
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
    <OnThisPage :outline="outline" />
    <div class="flex">
      <aside
        aria-label="Navigation"
        class="invisible sticky top-14 hidden h-[calc(100svh-3.5rem)] w-0 shrink-0 overflow-hidden lg:block lg:in-data-[sidebar-narrow=open]:visible lg:in-data-[sidebar-narrow=open]:w-65 lg:in-data-[sidebar-narrow=open]:border-e wide:invisible wide:w-0 wide:border-e-0 wide:in-data-[sidebar-wide=open]:visible wide:in-data-[sidebar-wide=open]:w-65 wide:in-data-[sidebar-wide=open]:border-e"
      >
        <DocsSidebar :outline="outline" class="w-65" />
      </aside>
      <main :class="['min-w-0 flex-1', active && 'md:min-w-80', active && expanded && 'md:hidden']">
        <slot />
      </main>
      <DemoPanel v-if="active" />
    </div>
    <NavDrawer :outline="outline" />
  </div>
</template>
