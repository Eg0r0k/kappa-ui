<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/ui/item'
import { neighbours, sidebarGroups } from '~/lib/sidebar'

const props = defineProps<{ path: string }>()

const nav = useDocsNavigation()
const links = computed(() => {
  const groups = sidebarGroups(nav.value)
  return neighbours(groups, props.path)
})
</script>

<template>
  <nav
    v-if="links.previous || links.next"
    aria-label="Previous and next page"
    data-slot="docs-page-footer"
    class="mt-12 grid gap-3 border-t pt-8 sm:grid-cols-2"
  >
    <Item v-if="links.previous" variant="outline" as-child>
      <NuxtLink :to="links.previous.path">
        <ItemActions>
          <ChevronLeft class="size-4 rtl:rotate-180" />
        </ItemActions>
        <ItemContent>
          <ItemDescription>Previous</ItemDescription>
          <ItemTitle>{{ links.previous.title }}</ItemTitle>
        </ItemContent>
      </NuxtLink>
    </Item>
    <Item v-if="links.next" variant="outline" class="sm:col-start-2 sm:text-end" as-child>
      <NuxtLink :to="links.next.path">
        <ItemContent>
          <ItemDescription>Next</ItemDescription>
          <ItemTitle class="sm:self-end">{{ links.next.title }}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRight class="size-4 rtl:rotate-180" />
        </ItemActions>
      </NuxtLink>
    </Item>
  </nav>
</template>
