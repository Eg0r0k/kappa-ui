<script setup lang="ts">
import { Time } from "@internationalized/date";

import { Field, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const value = new Time(14, 30, 15);
const granularities = ["hour", "minute", "second"] as const;
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-3">
    <Field v-for="granularity in granularities" :key="granularity">
      <FieldLabel class="capitalize">{{ granularity }}</FieldLabel>
      <InputTime :default-value="value" :granularity="granularity" :hour-cycle="24" />
    </Field>
  </div>
</template>
