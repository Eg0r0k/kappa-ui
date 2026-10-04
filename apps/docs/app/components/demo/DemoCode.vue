<script setup lang="ts">
import { useToast } from '@/ui/toast'
import { ScrollArea } from '@/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import CopyButton from '~/components/CopyButton.vue'

const props = defineProps<{ name: string }>()

const toast = useToast()
const { data: files } = useExampleCode(() => props.name)
const chosen = ref<string>()
const current = computed(() => files.value?.find((file) => file.filename === chosen.value) ?? files.value?.[0])

const choose = (value: string | number) => {
  chosen.value = String(value)
}
const basename = (filename: string) => filename.slice(filename.lastIndexOf('/') + 1)
</script>

<template>
  <Tabs
    :model-value="current?.filename"
    data-slot="demo-code"
    class="h-full min-h-0 gap-0 bg-muted/40"
    @update:model-value="choose"
  >
    <div class="flex h-10 shrink-0 items-center justify-between gap-2 border-b ps-2 pe-1">
      <TabsList variant="line" size="xs" aria-label="Example files" class="-mb-px self-end">
        <TabsTrigger
          v-for="file in files"
          :key="file.filename"
          :value="file.filename"
          :title="file.filename"
          class="font-mono"
        >
          {{ basename(file.filename) }}
        </TabsTrigger>
      </TabsList>
      <CopyButton v-if="current" :value="current.source" @copied="toast.add({ title: 'Copied', color: 'success' })" />
    </div>
    <TabsContent v-for="file in files" :key="file.filename" :value="file.filename" class="min-h-0 flex-1">
      <ScrollArea class="h-full">
        <div class="min-h-full bg-card p-4 text-sm leading-6" v-html="file.html" />
      </ScrollArea>
    </TabsContent>
  </Tabs>
</template>
