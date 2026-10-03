<script setup lang="ts">
import { Time } from "@internationalized/date";
import type { TimeValue } from "reka-ui";
import { computed, shallowRef } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const min = new Time(9, 0);
const max = new Time(18, 0);
const time = shallowRef<TimeValue | undefined>(new Time(19, 30));

const minutes = (value: TimeValue) => value.hour * 60 + value.minute;
const invalid = computed(
  () => time.value !== undefined && (minutes(time.value) < minutes(min) || minutes(time.value) > minutes(max)),
);
</script>

<template>
  <Field :invalid="invalid" class="w-full max-w-xs">
    <FieldLabel>Delivery time</FieldLabel>
    <InputTime v-model="time" :min-value="min" :max-value="max" :hour-cycle="24" />
    <FieldError v-if="invalid" errors="We deliver between 09:00 and 18:00." />
    <FieldDescription v-else>Between 09:00 and 18:00.</FieldDescription>
  </Field>
</template>
