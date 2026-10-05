<script setup lang="ts">
import { CHANGELOG_PATH, COMPONENTS_PATH } from '~/lib/sidebar'
import { Button } from '@/ui/button'

const links = [
  { label: 'Docs', to: '/docs/getting-started/quick-start' },
  { label: 'Components', to: COMPONENTS_PATH },
  { label: 'Changelog', to: CHANGELOG_PATH },
]
</script>

<template>
  <footer class="mt-16 border-t">
    <div
      class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-body-md text-muted-foreground"
    >
      <p>kappa-ui · MIT licence</p>
      <nav aria-label="Footer" class="flex flex-wrap items-center gap-1">
        <Button v-for="link in links" :key="link.to" variant="ghost" color="neutral" size="sm" as-child>
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </Button>
        <Button variant="ghost" color="neutral" size="sm" as-child>
          <a href="https://github.com/Eg0r0k/kappa-ui" target="_blank" rel="noreferrer">GitHub</a>
        </Button>
      </nav>
    </div>
  </footer>
</template>
