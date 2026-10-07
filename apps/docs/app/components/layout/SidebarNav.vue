<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed } from 'vue'

import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible'
import { filterGroups, highlight, pageId, type SidebarGroup } from '~/lib/sidebar'

const props = defineProps<{
  groups: SidebarGroup[]
  activePath: string
  query: string
  badges: Record<string, 'new' | 'updated'>
  mod: string
  idPrefix?: string
  highlighted?: string
}>()
const open = defineModel<string[]>('open', { default: () => [] })
const emit = defineEmits<{ navigate: []; search: [query: string]; highlight: [path: string] }>()

const visible = computed(() => filterGroups(props.groups, props.query))
const filtering = computed(() => props.query.trim() !== '')

const isOpen = (key: string) => filtering.value || open.value.includes(key)
const toggle = (key: string, value: boolean) => {
  if (filtering.value) return
  open.value = value ? [...open.value, key] : open.value.filter((item) => item !== key)
}

const pageLink = `
  flex items-center gap-2 rounded-md px-3 py-1.5 text-muted-foreground transition-colors
  hover:bg-accent hover:text-accent-foreground
  data-highlighted:bg-accent data-highlighted:text-accent-foreground
  focus-visible:focus-ring
  aria-[current=page]:bg-primary/10 aria-[current=page]:font-medium aria-[current=page]:text-primary
  max-md:min-h-11
`
</script>

<template>
  <nav
    :id="props.idPrefix && `${props.idPrefix}nav`"
    aria-label="Documentation"
    class="flex flex-col gap-1 text-body-md"
  >
    <div
      v-if="visible.length === 0"
      class="flex flex-col items-start gap-1 px-2 py-4 text-body-sm text-muted-foreground"
    >
      <p>Nothing here.</p>
      <Button variant="link" size="sm" class="h-auto p-0" @click="emit('search', props.query)">
        Search everything with {{ props.mod }} K
      </Button>
    </div>
    <template v-for="(group, position) in visible" :key="group.key">
      <div
        v-if="position > 0 && group.section !== visible[position - 1]?.section"
        data-slot="sidebar-section"
        class="mx-3 mt-3 border-t pt-3"
      >
        <p v-if="group.section === 'components'" class="pb-1 text-label-sm text-muted-foreground">Components</p>
      </div>
      <Collapsible :data-group="group.key" :open="isOpen(group.key)" @update:open="toggle(group.key, $event)">
        <CollapsibleTrigger as-child>
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            class="group/trigger w-full justify-between text-body-md font-semibold text-foreground max-md:min-h-11"
          >
            {{ group.title }}
            <ChevronRight
              data-icon="inline-end"
              class="transition-transform duration-short-4 ease-standard group-data-[state=open]/trigger:rotate-90 motion-reduce:transition-none"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul class="ms-3 flex flex-col gap-0.5 border-s py-1 ps-2">
            <li v-for="page in group.pages" :key="page.path">
              <NuxtLink
                :id="props.idPrefix && pageId(props.idPrefix, page.path)"
                :to="page.path"
                :aria-current="page.path === props.activePath ? 'page' : undefined"
                :data-highlighted="page.path === props.highlighted ? '' : undefined"
                :class="pageLink"
                @click="emit('navigate')"
                @pointermove="emit('highlight', page.path)"
              >
                <span class="min-w-0 flex-1 truncate">
                  <template v-for="(segment, index) in highlight(page.title, props.query)" :key="index">
                    <mark v-if="segment.match" class="rounded-sm bg-primary/15 text-foreground">{{
                      segment.text
                    }}</mark>
                    <template v-else>{{ segment.text }}</template>
                  </template>
                </span>
                <Badge
                  v-if="props.badges[page.path]"
                  size="xs"
                  variant="soft"
                  :color="props.badges[page.path] === 'new' ? 'success' : 'info'"
                >
                  {{ props.badges[page.path] }}
                </Badge>
              </NuxtLink>
            </li>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </template>
  </nav>
</template>
