<script setup lang="ts">
import type { PageOutline } from '~/lib/outline'

const props = defineProps<{ outline: PageOutline; active?: string }>()

const link = `
  block rounded-sm py-1 text-body-sm text-muted-foreground transition-colors
  hover:text-foreground
  focus-visible:focus-ring
  aria-[current=location]:font-medium aria-[current=location]:text-primary
`
</script>

<template>
  <nav data-slot="on-this-page-rail" aria-label="On this page" class="flex flex-col gap-2">
    <p class="text-body-sm font-medium text-foreground">On this page</p>
    <ul class="flex flex-col border-s ps-3">
      <li v-for="heading in props.outline.headings" :key="heading.id">
        <NuxtLink
          :to="`#${heading.id}`"
          :aria-current="props.active === heading.id ? 'location' : undefined"
          :class="link"
        >
          {{ heading.text }}
        </NuxtLink>
        <ul v-if="heading.id === 'examples' && props.outline.examples.length" class="ms-3 flex flex-col">
          <li v-for="example in props.outline.examples" :key="example.slug">
            <NuxtLink :to="`#${example.slug}`" :class="link">{{ example.title }}</NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
