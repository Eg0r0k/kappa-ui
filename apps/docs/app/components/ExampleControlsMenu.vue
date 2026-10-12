<script setup lang="ts">
import { Settings2 } from '@lucide/vue'

import { Button } from '@/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import ExampleControls from '~/components/ExampleControls.vue'
import type { ControlValue, ExampleControl } from '~/lib/example-controls'

const props = defineProps<{ controls: readonly ExampleControl[]; changed: boolean }>()
const model = defineModel<Record<string, ControlValue>>({ required: true })
const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div data-slot="example-controls-menu">
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="soft" color="neutral" size="xs">
          <Settings2 data-icon="inline-start" />
          Props
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-64 p-3">
        <ExampleControls v-model="model" :controls="props.controls" :changed="props.changed" @reset="emit('reset')" />
      </PopoverContent>
    </Popover>
  </div>
</template>
