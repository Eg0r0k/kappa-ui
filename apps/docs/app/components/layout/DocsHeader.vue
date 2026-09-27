<script setup lang="ts">
import MobileNav from '~/components/layout/MobileNav.vue'
import SearchDialog from '~/components/layout/SearchDialog.vue'
import ThemeCustomizer from '~/components/layout/ThemeCustomizer.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 lg:px-6">
      <MobileNav />
      <NuxtLink to="/" class="rounded-sm font-semibold tracking-tight focus-visible:focus-ring">kappa-ui</NuxtLink>
      <nav aria-label="Main" class="hidden items-center gap-4 text-sm md:flex">
        <NuxtLink
          to="/docs/getting-started/introduction"
          class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:focus-ring"
        >
          Docs
        </NuxtLink>
        <NuxtLink
          to="/themes"
          class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:focus-ring aria-[current=page]:text-foreground"
        >
          Themes
        </NuxtLink>
      </nav>
      <div class="flex flex-1 justify-end">
        <SearchDialog />
      </div>
      <div class="flex items-center gap-1">
        <ThemeCustomizer />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
