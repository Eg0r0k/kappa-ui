<script setup lang="ts">
import { Card } from '@/ui/card'
import DeferredPreview from '~/components/DeferredPreview.vue'
import type { ColorScheme } from '~/lib/preview-protocol'

const props = defineProps<{
  name: string
  title: string
  selected: boolean
  colorScheme: ColorScheme
  siteTheme: string
  src?: string
}>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <Card variant="soft" size="sm" data-slot="mini-preview" class="relative gap-0 p-1.5">
    <DeferredPreview
      inert
      :name="props.name"
      :title="props.title"
      :color-scheme="props.colorScheme"
      dir="ltr"
      :site-theme="props.siteTheme"
      :src="props.src"
      height="100%"
      class="h-56 overflow-hidden rounded-[max(0px,calc(var(--radius-lg)-0.375rem))]"
    />
    <div class="flex items-center gap-2 px-2 pt-2 pb-1">
      <span
        v-if="props.selected"
        data-slot="mini-preview-dot"
        class="size-1.5 shrink-0 rounded-full bg-primary"
        aria-hidden="true"
      />
      <button
        type="button"
        :aria-current="props.selected ? 'true' : undefined"
        class="truncate text-start text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:focus-ring"
        @click="emit('select')"
      >
        {{ props.title }}
      </button>
    </div>
  </Card>
</template>
