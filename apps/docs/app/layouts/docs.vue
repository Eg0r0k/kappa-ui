<script setup lang="ts">
import DocsHeader from '~/components/layout/DocsHeader.vue'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'
import NavDrawer from '~/components/layout/NavDrawer.vue'
import OnThisPage from '~/components/layout/OnThisPage.vue'
import { outlineOf } from '~/lib/outline'

const route = useRoute()
const { wide, narrow } = useDocsShell()
const { data: page } = await useDocsPage(() => route.path.replace(/\/+$/, ''))
const outline = computed(() => outlineOf(page.value))
</script>

<template>
  <div
    data-slot="docs-shell"
    :data-sidebar-wide="wide"
    :data-sidebar-narrow="narrow ? 'open' : 'closed'"
    class="min-h-svh bg-background text-foreground"
  >
    <DocsHeader />
    <OnThisPage :outline="outline" />
    <div class="flex">
      <aside
        aria-label="Navigation"
        class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-65 shrink-0 border-e lg:in-data-[sidebar-narrow=open]:block wide:hidden wide:in-data-[sidebar-wide=open]:block"
      >
        <DocsSidebar :outline="outline" />
      </aside>
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
    <NavDrawer :outline="outline" />
  </div>
</template>
