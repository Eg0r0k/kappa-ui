<script setup lang="ts">
import { Search } from '@lucide/vue'
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  ListboxContent,
  ListboxFilter,
  ListboxItem,
  ListboxRoot,
} from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import { Button } from '@/ui/button'
import { Kbd } from '@/ui/kbd'
import { searchSections, type SearchSection } from '~/lib/search'

const open = ref(false)
const query = ref('')
const sections = shallowRef<SearchSection[]>([])
const results = computed(() => searchSections(sections.value, query.value))

const load = async () => {
  if (sections.value.length === 0) sections.value = await $fetch<SearchSection[]>('/search.json')
}

watch(open, (value) => {
  if (value) load()
  else query.value = ''
})

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const select = async (value: unknown) => {
  if (typeof value !== 'string') return
  open.value = false
  await navigateTo(value)
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        color="neutral"
        size="sm"
        aria-keyshortcuts="Meta+K Control+K"
        class="w-40 justify-start text-muted-foreground sm:w-56"
      >
        <Search data-icon="inline-start" />
        Search docs
        <Kbd class="ms-auto" aria-hidden="true">⌘K</Kbd>
      </Button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="fixed inset-x-0 top-24 z-50 mx-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-shadow-lg"
      >
        <DialogTitle class="sr-only">Search documentation</DialogTitle>
        <DialogDescription class="sr-only">Type to search pages and sections, then press Enter.</DialogDescription>
        <ListboxRoot highlight-on-hover @update:model-value="select">
          <ListboxFilter
            v-model="query"
            auto-focus
            placeholder="Search docs…"
            class="h-12 w-full border-b bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <ListboxContent class="max-h-80 overflow-y-auto p-2">
            <p v-if="query && results.length === 0" class="px-2 py-6 text-center text-sm text-muted-foreground">
              No results for “{{ query }}”.
            </p>
            <ListboxItem
              v-for="result in results"
              :key="result.id"
              :value="result.id"
              class="flex cursor-pointer flex-col rounded-md px-3 py-2 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <span class="font-medium">{{ result.title }}</span>
              <span v-if="result.titles.length" class="text-xs text-muted-foreground">
                {{ result.titles.join(' › ') }}
              </span>
            </ListboxItem>
          </ListboxContent>
        </ListboxRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
