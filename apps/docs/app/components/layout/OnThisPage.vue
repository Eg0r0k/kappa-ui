<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

import { Button } from '@/ui/button'
import { Menu, MenuItem, MenuTrigger } from '@/ui/menu'
import type { PageOutline } from '~/lib/outline'

const props = defineProps<{ outline?: PageOutline }>()

const active = useScrollSpy(() => props.outline?.headings.map((heading) => heading.id) ?? [])
const current = computed(
  () => props.outline?.headings.find((heading) => heading.id === active.value)?.text ?? 'On this page',
)
</script>

<template>
  <div
    v-if="props.outline?.headings.length"
    data-slot="on-this-page"
    class="sticky top-14 z-30 border-b bg-background px-4 py-1 md:hidden"
  >
    <MenuTrigger as-child>
      <Button variant="ghost" color="neutral" class="min-h-11 w-full justify-between">
        <span class="truncate">{{ current }}</span>
        <ChevronDown data-icon="inline-end" />
      </Button>
    </MenuTrigger>
    <Menu class="w-[calc(100vw-2rem)]">
      <MenuItem v-for="heading in props.outline.headings" :key="heading.id" as-child class="min-h-11">
        <NuxtLink :to="`#${heading.id}`">{{ heading.text }}</NuxtLink>
      </MenuItem>
    </Menu>
  </div>
</template>
