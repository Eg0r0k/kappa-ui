<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/ui/button'

const dark = ref(false)

function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}
</script>

<template>
  <main class="min-h-svh bg-background p-10 text-foreground">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">delta-ui</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Development showcase. Components live in packages/registry.
        </p>
      </div>
      <Button variant="outline" size="sm" class="press-scale" @click="toggleTheme">
        {{ dark ? 'Light' : 'Dark' }}
      </Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Variants</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Sizes</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">+</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">States</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
      <Button as="a" href="https://vuejs.org">as=&quot;a&quot;</Button>
      <Button as-child>
        <a href="https://vuejs.org">as-child</a>
      </Button>
      <Button class="rounded-full">class overrides the radius</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Press feedback</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      <code>press-scale</code> is a utility, not a prop - pass it through <code>class</code>. Hold
      the second button to see it dip. It respects <code>prefers-reduced-motion</code>.
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <Button>No press feedback</Button>
      <Button class="press-scale">Press and hold me</Button>
      <Button variant="outline" class="press-scale">Outline, same utility</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Touch target</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      All three look identical. The outlines below are drawn by the showcase, not by the component -
      they reveal where each button actually accepts a press.
    </p>
    <div
      class="flex flex-wrap items-center gap-6 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
    >
      <Button size="sm">none - 32px</Button>
      <Button size="sm" touch-target="expand">expand - 48px, may overlap</Button>
      <Button size="sm" touch-target="wrapper">wrapper - 48px, reserved</Button>
      <Button size="icon" touch-target="expand" aria-label="Add">+</Button>
      <Button size="sm" touch-target="expand">Ok</Button>
    </div>
    <p class="mt-3 max-w-prose text-sm text-muted-foreground">
      The last one is the case width expansion exists for: "Ok" renders about 40px wide, so its
      target grows sideways too. On the wider buttons above, max(48px, 100%) resolves to 100% and
      changes nothing.
    </p>
  </main>
</template>
