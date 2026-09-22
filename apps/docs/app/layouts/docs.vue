<script setup lang="ts">
import DocsHeader from '~/components/layout/DocsHeader.vue'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <DocsHeader />
    <div class="mx-auto flex max-w-screen-2xl">
      <aside class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 border-e md:block">
        <DocsSidebar />
      </aside>
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
