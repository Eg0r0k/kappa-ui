<script setup lang="ts">
import { Check, Video } from '@lucide/vue'
import { computed, ref, shallowRef, useId, watch } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/ui/field'
import { InputTime } from '@/ui/input-time'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'

type Clock = { hour: number; minute: number }

const durations = ['15', '30', '60']
const zones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
]

const durationLabel = useId()
const duration = ref('30')
const start = shallowRef<Clock>()
const zone = ref('Europe/Berlin')
const touched = ref(false)
const booked = ref(false)

const pad = (value: number) => String(value).padStart(2, '0')
const startLabel = computed(() => (start.value ? `${pad(start.value.hour)}:${pad(start.value.minute)}` : ''))

watch([duration, start, zone], () => {
  booked.value = false
})

const pickDuration = (value: unknown) => {
  if (typeof value === 'string' && value) duration.value = value
}

const setStart = (value: Clock | undefined) => {
  start.value = value
}

const book = () => {
  touched.value = true
  if (start.value) booked.value = true
}
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Book a call</CardTitle>
      <CardDescription>Pick a time to talk with the Kappa team.</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup class="gap-4">
        <div class="flex flex-col gap-2">
          <span :id="durationLabel" class="text-label-lg">Duration</span>
          <ToggleGroup
            type="single"
            variant="outline"
            active-variant="subtle"
            active-color="primary"
            :aria-labelledby="durationLabel"
            :model-value="duration"
            class="w-full"
            @update:model-value="pickDuration"
          >
            <ToggleGroupItem v-for="minutes in durations" :key="minutes" :value="minutes" class="flex-1">
              {{ minutes }} min
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div class="grid grid-cols-2 items-start gap-3">
          <Field :invalid="touched && !start">
            <FieldLabel>Start time</FieldLabel>
            <InputTime :hour-cycle="24" :step="{ minute: 15 }" @update:model-value="setStart" />
            <FieldError v-if="touched && !start" errors="Pick a time." />
          </Field>
          <Field>
            <FieldLabel>Time zone</FieldLabel>
            <Select v-model="zone">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in zones" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Button :color="booked ? 'success' : 'primary'" class="w-full" @click="book">
        <Check v-if="booked" data-icon="inline-start" />
        <Video v-else data-icon="inline-start" />
        {{ booked ? `Booked for ${startLabel}` : `Book ${duration}-min call` }}
      </Button>
    </CardFooter>
  </ShowcaseCard>
</template>
