<script setup lang="ts">
import { ScrollArea } from '@/ui/scroll-area'
import SidebarFilter from '~/components/layout/SidebarFilter.vue'
import SidebarNav from '~/components/layout/SidebarNav.vue'
import type { PageOutline } from '~/lib/outline'
import badgeData from '~/generated/badges.json'
import { componentGroups, docsGroups, groupOf, modKey, sectionOf, type SidebarGroup } from '~/lib/sidebar'

type Badge = { kind: 'new' | 'updated'; until: string }

const props = defineProps<{ outline?: PageOutline }>()
const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const nav = useDocsNavigation()
const { show } = useSearchDialog()

const groups = computed<SidebarGroup[]>(() =>
  sectionOf(route.path) === 'components' ? componentGroups(nav.value) : docsGroups(nav.value),
)

const open = useCookie<string[]>('kappa-docs-groups', {
  default: () => [],
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})
watch(
  [() => route.path, groups],
  () => {
    const key = groupOf(groups.value, route.path)
    if (key && !open.value.includes(key)) open.value = [...open.value, key]
  },
  { immediate: true },
)

const query = ref('')
const now = ref<number>()
const mod = ref('⌘')
onMounted(() => {
  now.value = Date.now()
  mod.value = modKey(navigator.platform)
})

const badges = computed(() =>
  Object.fromEntries(
    groups.value
      .flatMap((group) => group.pages)
      .flatMap((page) => {
        const badge = page.component ? (badgeData as Record<string, Badge>)[page.component] : undefined
        if (!badge || (now.value !== undefined && Date.parse(badge.until) < now.value)) return []
        return [[page.path, badge.kind]]
      }),
  ),
)

const activeHeading = useScrollSpy(() => props.outline?.headings.map((heading) => heading.id) ?? [])

const search = (value: string) => {
  emit('navigate')
  show(value)
}
</script>

<template>
  <div data-slot="docs-sidebar" class="flex h-full flex-col">
    <div class="p-4 pb-2">
      <SidebarFilter v-model="query" />
    </div>
    <ScrollArea class="min-h-0 flex-1">
      <div class="px-4 pt-2 pb-6">
        <SidebarNav
          v-model:open="open"
          :groups="groups"
          :active-path="route.path"
          :query="query"
          :outline="props.outline"
          :active-heading="activeHeading"
          :badges="badges"
          :mod="mod"
          @navigate="emit('navigate')"
          @search="search"
        />
      </div>
    </ScrollArea>
  </div>
</template>
