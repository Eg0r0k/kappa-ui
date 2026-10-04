<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed } from 'vue'

import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible'
import type { PageOutline } from '~/lib/outline'
import { filterGroups, highlight, type SidebarGroup } from '~/lib/sidebar'

const props = defineProps<{
  groups: SidebarGroup[]
  activePath: string
  query: string
  outline?: PageOutline
  activeHeading?: string
  currentExample?: string
  badges: Record<string, 'new' | 'updated'>
  mod: string
}>()
const open = defineModel<string[]>('open', { default: () => [] })
const emit = defineEmits<{ navigate: []; search: [query: string] }>()

const visible = computed(() => filterGroups(props.groups, props.query))
const filtering = computed(() => props.query.trim() !== '')

const isOpen = (key: string) => filtering.value || open.value.includes(key)
const toggle = (key: string, value: boolean) => {
  if (filtering.value) return
  open.value = value ? [...open.value, key] : open.value.filter((item) => item !== key)
}

const pageLink = `
  flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors
  hover:bg-accent hover:text-accent-foreground
  focus-visible:focus-ring
  aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground
  max-md:min-h-11
`
const anchorLink = `
  block rounded-sm py-1 text-body-sm text-muted-foreground transition-colors
  hover:text-foreground
  focus-visible:focus-ring
  aria-[current=location]:font-medium aria-[current=location]:text-foreground
  max-md:min-h-11 max-md:py-2.5
`
</script>

<template>
  <nav aria-label="Documentation" class="flex flex-col gap-1 text-body-md">
    <div
      v-if="visible.length === 0"
      class="flex flex-col items-start gap-1 px-2 py-4 text-body-sm text-muted-foreground"
    >
      <p>Nothing here.</p>
      <Button variant="link" size="sm" class="h-auto p-0" @click="emit('search', props.query)">
        Search everything with {{ props.mod }} K
      </Button>
    </div>
    <Collapsible
      v-for="group in visible"
      :key="group.key"
      :data-group="group.key"
      :open="isOpen(group.key)"
      @update:open="toggle(group.key, $event)"
    >
      <CollapsibleTrigger as-child>
        <Button
          variant="ghost"
          color="neutral"
          size="sm"
          class="group/trigger w-full justify-between font-medium max-md:min-h-11"
        >
          {{ group.title }}
          <ChevronRight
            data-icon="inline-end"
            class="transition-transform duration-short-4 ease-standard group-data-[state=open]/trigger:rotate-90 motion-reduce:transition-none"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul class="flex flex-col gap-0.5 py-1">
          <li v-for="page in group.pages" :key="page.path">
            <NuxtLink
              :to="page.path"
              :aria-current="page.path === props.activePath ? 'page' : undefined"
              :class="pageLink"
              @click="emit('navigate')"
            >
              <span class="min-w-0 flex-1 truncate">
                <template v-for="(segment, index) in highlight(page.title, props.query)" :key="index">
                  <mark v-if="segment.match" class="rounded-sm bg-primary/15 text-foreground">{{ segment.text }}</mark>
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
            <ul
              v-if="page.path === props.activePath && props.outline && !filtering"
              class="my-1 ms-4 flex flex-col border-s ps-3"
            >
              <li v-for="heading in props.outline.headings" :key="heading.id">
                <NuxtLink
                  :to="`#${heading.id}`"
                  :aria-current="props.activeHeading === heading.id ? 'location' : undefined"
                  :class="anchorLink"
                  @click="emit('navigate')"
                >
                  {{ heading.text }}
                </NuxtLink>
                <ul v-if="heading.id === 'examples' && props.outline.examples.length" class="ms-3 flex flex-col">
                  <li v-for="example in props.outline.examples" :key="example.slug">
                    <NuxtLink :to="`#${example.slug}`" :class="anchorLink" @click="emit('navigate')">
                      <span
                        v-if="example.slug === props.currentExample"
                        data-slot="sidebar-example-dot"
                        class="me-1.5 hidden size-1.5 rounded-full bg-primary align-middle md:inline-block"
                        aria-hidden="true"
                      />
                      {{ example.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </nav>
</template>
