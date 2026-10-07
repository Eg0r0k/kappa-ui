<script setup lang="ts">
import { Field, FieldLabel } from '@/ui/field'
import { Slider } from '@/ui/slider'

const props = defineProps<{
  label: string
  value: string
  min: number
  max: number
  step: number
  /** A background image for the track, such as the hues the slider runs through. */
  track?: string
}>()

const model = defineModel<number>({ required: true })
</script>

<template>
  <Field class="gap-1.5">
    <div class="flex items-baseline justify-between gap-2">
      <FieldLabel>{{ props.label }}</FieldLabel>
      <span class="text-body-sm text-muted-foreground tabular-nums">{{ props.value }}</span>
    </div>
    <Slider
      v-model="model"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      size="sm"
      :variant="props.track ? 'inset' : 'default'"
      :style="props.track ? { '--track': props.track } : undefined"
      :class="
        props.track &&
        '[&>[data-slot=slider-track]]:bg-(image:--track) [&>[data-slot=slider-track]]:bg-origin-border [&>[data-slot=slider-track]>[data-slot=slider-range]]:bg-transparent'
      "
    />
  </Field>
</template>
