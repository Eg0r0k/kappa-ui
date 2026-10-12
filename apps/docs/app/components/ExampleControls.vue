<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { useId } from 'vue'

import { Button } from '@/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Switch } from '@/ui/switch'
import { type ControlValue, type ExampleControl, controlKind } from '~/lib/example-controls'

const props = defineProps<{ controls: readonly ExampleControl[]; changed: boolean }>()
const model = defineModel<Record<string, ControlValue>>({ required: true })
const emit = defineEmits<{ reset: [] }>()

const id = useId()
const labelId = (prop: string) => `${id}-${prop}`

const set = (prop: string, value: ControlValue) => {
  model.value = { ...model.value, [prop]: value }
}

const pick = (prop: string, value: unknown) => {
  if (typeof value === 'string' && value !== '') set(prop, value)
}
</script>

<template>
  <div data-slot="example-controls" class="flex flex-wrap items-center gap-x-5 gap-y-2 px-2.5 py-2">
    <div v-for="control in props.controls" :key="control.prop" class="flex items-center gap-2">
      <span :id="labelId(control.prop)" class="font-mono text-label-sm text-muted-foreground">{{ control.prop }}</span>
      <Switch
        v-if="controlKind(control) === 'switch'"
        size="sm"
        :model-value="model[control.prop] === true"
        :aria-labelledby="labelId(control.prop)"
        @update:model-value="(value: boolean) => set(control.prop, value)"
      />
      <Select
        v-else
        :model-value="String(model[control.prop])"
        @update:model-value="(value: unknown) => pick(control.prop, value)"
      >
        <SelectTrigger size="xs" variant="ghost" class="w-auto" :aria-labelledby="labelId(control.prop)">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="value in control.values" :key="String(value)" :value="String(value)">
            {{ value }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Button v-if="props.changed" variant="ghost" color="neutral" size="xs" class="ms-auto" @click="emit('reset')">
      <RotateCcw data-icon="inline-start" />
      Reset
    </Button>
  </div>
</template>
