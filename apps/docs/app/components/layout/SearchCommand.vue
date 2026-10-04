<script setup lang="ts">
import { CommandDialog, CommandInput, CommandItem, CommandList } from '@/ui/command'
import ScrollBox from '~/components/ScrollBox.vue'
import { searchSections, type SearchSection } from '~/lib/search'

const { open, query } = useSearchDialog()
const sections = shallowRef<SearchSection[]>([])
const results = computed(() => searchSections(sections.value, query.value))

watch(open, async (value) => {
  if (!value) {
    query.value = ''
    return
  }
  if (sections.value.length === 0) sections.value = await $fetch<SearchSection[]>('/search.json')
})

const onKeydown = (event: KeyboardEvent) => {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' || event.defaultPrevented) return
  event.preventDefault()
  open.value = !open.value
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const select = async (path: string) => {
  open.value = false
  await navigateTo(path)
}
</script>

<template>
  <CommandDialog
    v-model:open="open"
    ignore-filter
    title="Search documentation"
    description="Type to search pages and sections, then press Enter."
    class="top-[12svh] translate-y-0 [&_[data-slot=command-input-wrapper]:last-child]:border-b-0"
  >
    <CommandInput v-model="query" placeholder="Search docs…" />
    <ScrollBox v-if="query" :max-height="384">
      <CommandList class="max-h-none overflow-visible">
        <p v-if="query && results.length === 0" class="px-3 py-6 text-center text-body-sm text-muted-foreground">
          No results for “{{ query }}”.
        </p>
        <CommandItem
          v-for="result in results"
          :key="result.id"
          :value="result.id"
          class="h-auto flex-col items-start gap-0.5 py-2"
          @select="select(result.id)"
        >
          <span class="font-medium">{{ result.title }}</span>
          <span v-if="result.titles.length" class="text-body-sm text-muted-foreground">
            {{ result.titles.join(' › ') }}
          </span>
        </CommandItem>
      </CommandList>
    </ScrollBox>
  </CommandDialog>
</template>
