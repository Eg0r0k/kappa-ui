<script setup lang="ts">
import { Button } from '@/ui/button'
</script>

<template>
  <main class="min-h-svh bg-white p-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
    <h1 class="text-2xl font-semibold tracking-tight">delta-ui</h1>
    <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      Development showcase. Components live in packages/registry.
    </p>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Variants</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Sizes</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">+</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">States</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
      <Button as="a" href="https://vuejs.org">as=&quot;a&quot;</Button>
      <Button as-child>
        <a href="https://vuejs.org">as-child</a>
      </Button>
      <Button class="rounded-full">class overrides the radius</Button>
    </div>
  </main>
</template>
