<script setup lang="ts">
import { Plus } from '@lucide/vue'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import DocsFigure from '~/components/DocsFigure.vue'
import ScrollBox from '~/components/ScrollBox.vue'

const rows = [
  { size: 'xs', button: 'xs', height: 28, line: 'h-(--control-height-xs)' },
  { size: 'sm', button: 'sm', height: 32, line: 'h-(--control-height-sm)' },
  { size: 'md', button: 'default', height: 36, line: 'h-(--control-height-md)' },
  { size: 'lg', button: 'lg', height: 40, line: 'h-(--control-height-lg)' },
  { size: 'xl', button: 'xl', height: 48, line: 'h-(--control-height-xl)' },
] as const
</script>

<template>
  <DocsFigure title="One size, one line">
    <ScrollBox>
      <div class="flex min-w-max flex-col gap-5 p-6 sm:p-8" inert>
        <div v-for="row in rows" :key="row.size" :class="['relative isolate flex items-center gap-3', row.line]">
          <span class="absolute inset-x-0 top-0 -z-10 border-t border-dashed border-primary/40" />
          <span class="absolute inset-x-0 bottom-0 -z-10 border-b border-dashed border-primary/40" />
          <span class="w-6 font-mono text-xs text-muted-foreground">{{ row.size }}</span>
          <Button :size="row.button"><Plus data-icon="inline-start" />Add</Button>
          <Input :size="row.size" placeholder="Search" class="w-40" />
          <Select>
            <SelectTrigger :size="row.size" class="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
            </SelectContent>
          </Select>
          <span class="ms-auto ps-3 font-mono text-xs text-muted-foreground">{{ row.height }}px</span>
        </div>
      </div>
    </ScrollBox>
  </DocsFigure>
</template>
