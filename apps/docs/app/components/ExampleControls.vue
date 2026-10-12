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
  <div data-slot="example-controls" class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2">
    <template v-for="control in props.controls" :key="control.prop">
      <span :id="labelId(control.prop)" class="font-mono text-label-sm text-muted-foreground">{{ control.prop }}</span>
      <Switch
        v-if="controlKind(control) === 'switch'"
        size="sm"
        class="justify-self-start"
        :model-value="model[control.prop] === true"
        :aria-labelledby="labelId(control.prop)"
        @update:model-value="(value: boolean) => set(control.prop, value)"
      />
      <Select
        v-else
        :model-value="String(model[control.prop])"
        @update:model-value="(value: unknown) => pick(control.prop, value)"
      >
        <SelectTrigger size="xs" class="w-full" :aria-labelledby="labelId(control.prop)">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="value in control.values" :key="String(value)" :value="String(value)">
            {{ value }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
    <Button
      v-if="props.changed"
      variant="soft"
      color="destructive"
      size="xs"
      class="col-span-2 w-full"
      @click="emit('reset')"
    >
      <RotateCcw data-icon="inline-start" />
      Reset
    </Button>
  </div>
</template>
