<script setup lang="ts">
import { ChevronDown, ChevronLeft, ChevronRight, Ellipsis, Link, Maximize2, Minimize2, X } from '@lucide/vue'

import { Button } from '@/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group'
import { Menu, MenuItem, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/ui/menu'
import { useToast } from '@/ui/toast'
import { vTooltip } from '@/ui/tooltip'

const demo = injectDemo()
const { examples, selected, index, previous, next, expanded } = demo
const route = useRoute()
const toast = useToast()

const current = computed({
  get: () => selected.value?.slug,
  set: (slug?: string) => {
    if (slug) demo.select(slug)
  },
})

const step = (example: { slug: string } | undefined) => {
  if (example) demo.select(example.slug)
}

const copyLink = async () => {
  if (!selected.value) return
  await navigator.clipboard.writeText(`${window.location.origin}${route.path}#${selected.value.slug}`)
  toast.add({ title: 'Link copied', color: 'success' })
}
</script>

<template>
  <div
    data-slot="demo-toolbar"
    class="flex min-h-12 w-full shrink-0 items-center gap-2 border-b bg-muted/40 px-2 py-1.5"
  >
    <ButtonGroup aria-label="Example" class="min-w-0">
      <Button
        v-tooltip="'Previous example'"
        variant="soft"
        color="neutral"
        size="icon-sm"
        aria-label="Previous example"
        :disabled="!previous"
        @click="step(previous)"
      >
        <ChevronLeft />
      </Button>
      <ButtonGroupSeparator />
      <MenuTrigger as-child>
        <Button
          id="demo-example-picker"
          variant="soft"
          color="neutral"
          size="sm"
          class="min-w-0"
          aria-label="Choose an example"
        >
          <span data-slot="demo-title" class="truncate">{{ selected?.title }}</span>
          <span class="text-muted-foreground tabular-nums">{{ index + 1 }}/{{ examples.length }}</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </MenuTrigger>
      <ButtonGroupSeparator />
      <Button
        v-tooltip="'Next example'"
        variant="soft"
        color="neutral"
        size="icon-sm"
        aria-label="Next example"
        :disabled="!next"
        @click="step(next)"
      >
        <ChevronRight />
      </Button>
    </ButtonGroup>
    <Menu target="#demo-example-picker" size="sm" anchor="bottom start" self="top start">
      <MenuRadioGroup v-model="current">
        <MenuRadioItem v-for="example in examples" :key="example.slug" :value="example.slug">
          {{ example.title }}
        </MenuRadioItem>
      </MenuRadioGroup>
    </Menu>
    <div class="ms-auto flex shrink-0 items-center gap-0.5">
      <span class="flex">
        <MenuTrigger as-child>
          <Button variant="ghost" color="neutral" size="icon-sm" aria-label="More example actions">
            <Ellipsis />
          </Button>
        </MenuTrigger>
        <Menu size="sm" anchor="bottom end" self="top end">
          <MenuItem @select="copyLink">
            <Link />
            Copy link
          </MenuItem>
        </Menu>
      </span>
      <Button
        v-tooltip="expanded ? 'Collapse' : 'Expand'"
        variant="ghost"
        color="neutral"
        size="icon-sm"
        :aria-label="expanded ? 'Collapse the panel' : 'Expand the panel'"
        :aria-pressed="expanded"
        class="max-md:hidden"
        @click="expanded = !expanded"
      >
        <Minimize2 v-if="expanded" />
        <Maximize2 v-else />
      </Button>
      <Button
        v-tooltip="'Close'"
        variant="ghost"
        color="neutral"
        size="icon-sm"
        aria-label="Close the panel"
        @click="demo.close"
      >
        <X />
      </Button>
    </div>
  </div>
</template>
