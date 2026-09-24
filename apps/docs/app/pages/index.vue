<script setup lang="ts">
import { Button } from '@/ui/button'

useSeoMeta({
  title: 'delta-ui',
  description: 'A shadcn-style component registry for Vue.',
})

defineOgImage('DeltaDocs', {
  title: 'Components you copy, not install.',
  description: 'A shadcn-style component registry for Vue.',
})
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-24">
    <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Components you copy, not install.</h1>
    <p class="text-lg text-muted-foreground">
      delta-ui is a shadcn-style registry for Vue. The CLI copies each component's source into your
      project, built on Reka UI and Tailwind CSS v4.
    </p>
    <div class="flex flex-wrap gap-3">
      <Button as-child size="lg">
        <NuxtLink to="/docs/getting-started/introduction">Get started</NuxtLink>
      </Button>
      <Button as-child size="lg" variant="outline" color="neutral">
        <NuxtLink to="/docs/components/button">Components</NuxtLink>
      </Button>
    </div>
  </main>
</template>
