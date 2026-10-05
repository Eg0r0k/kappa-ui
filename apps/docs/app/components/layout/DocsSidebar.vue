<script setup lang="ts">
import { ScrollArea } from '@/ui/scroll-area'
import SidebarFilter from '~/components/layout/SidebarFilter.vue'
import SidebarNav from '~/components/layout/SidebarNav.vue'
import type { PageOutline } from '~/lib/outline'
import { badgeOf } from '~/lib/badges'
import { bestMatch, groupOf, modKey, navigablePages, pageId, sidebarGroups, stepPage } from '~/lib/sidebar'

const props = defineProps<{ outline?: PageOutline }>()
const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const nav = useDocsNavigation()
const { show } = useSearchDialog()
const demo = injectDemo(null)

const groups = computed(() => sidebarGroups(nav.value))

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
        const badge = badgeOf(page.component, now.value)
        return badge ? [[page.path, badge]] : []
      }),
  ),
)

const activeHeading = useScrollSpy(() => props.outline?.headings.map((heading) => heading.id) ?? [])

const search = (value: string) => {
  emit('navigate')
  show(value)
}

const prefix = `${useId()}-`
const focused = ref(false)
const highlighted = ref<string>()
const pages = computed(() => navigablePages(groups.value, query.value, open.value))
const active = computed(() =>
  focused.value && pages.value.some((page) => page.path === highlighted.value) ? highlighted.value : undefined,
)

watch(query, (value) => {
  highlighted.value = bestMatch(groups.value, value)?.path
})
watch(active, async (path) => {
  if (!path) return
  await nextTick()
  document.getElementById(pageId(prefix, path))?.scrollIntoView({ block: 'nearest' })
})

const onFocus = () => {
  focused.value = true
  highlighted.value = bestMatch(groups.value, query.value)?.path
}
const onHighlight = (path: string) => {
  if (focused.value) highlighted.value = path
}
const move = (delta: 1 | -1) => {
  highlighted.value = stepPage(pages.value, active.value, delta, route.path)
}

const submit = async () => {
  const page = pages.value.find((item) => item.path === active.value) ?? bestMatch(groups.value, query.value)
  if (!page) {
    search(query.value)
    return
  }
  query.value = ''
  emit('navigate')
  await navigateTo(page.path)
}
</script>

<template>
  <div data-slot="docs-sidebar" class="flex h-full flex-col bg-card">
    <div class="p-4 pb-2">
      <SidebarFilter
        v-model="query"
        :active-descendant="active && pageId(prefix, active)"
        :controls="`${prefix}nav`"
        @submit="submit"
        @move="move"
        @focus="onFocus"
        @blur="focused = false"
      />
    </div>
    <ScrollArea
      class="min-h-0 flex-1 scroll-fade-overlay-y [--scroll-fade-color:var(--card)] [--scroll-fade-size:--spacing(6)]"
    >
      <div class="px-4 pt-2 pb-6">
        <SidebarNav
          v-model:open="open"
          :groups="groups"
          :active-path="route.path"
          :query="query"
          :outline="props.outline"
          :active-heading="activeHeading"
          :current-example="demo?.open.value ? demo.selected.value?.slug : undefined"
          :badges="badges"
          :mod="mod"
          :id-prefix="prefix"
          :highlighted="active"
          @navigate="emit('navigate')"
          @search="search"
          @highlight="onHighlight"
        />
      </div>
    </ScrollArea>
  </div>
</template>
