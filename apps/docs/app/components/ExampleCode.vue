<script setup lang="ts">
import { useToast } from '@/ui/toast'
import CopyButton from '~/components/CopyButton.vue'
import ScrollBox from '~/components/ScrollBox.vue'

const props = defineProps<{ name: string }>()

const toast = useToast()
const { data: files } = useExampleCode(() => props.name)

const basename = (filename: string) => filename.slice(filename.lastIndexOf('/') + 1)
</script>

<template>
  <div data-slot="example-code" class="flex flex-col gap-1">
    <div
      v-for="file in files"
      :key="file.filename"
      class="mt-1 overflow-hidden rounded-[max(0px,calc(var(--radius-xl)-0.25rem))] bg-card"
    >
      <div class="flex h-9 items-center justify-between gap-2 border-b ps-3 pe-1">
        <span :title="file.filename" class="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {{ basename(file.filename) }}
        </span>
        <CopyButton :value="file.source" @copied="toast.add({ title: 'Copied', color: 'success' })" />
      </div>
      <ScrollBox :max-height="512" class="p-4 text-sm leading-6">
        <div v-html="file.html" />
      </ScrollBox>
    </div>
  </div>
</template>
