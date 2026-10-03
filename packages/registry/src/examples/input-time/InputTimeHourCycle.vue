<script setup lang="ts">
import { Time } from "@internationalized/date";

import { Field, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const value = new Time(14, 30);
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-2">
    <Field>
      <FieldLabel>24-hour</FieldLabel>
      <InputTime :default-value="value" :hour-cycle="24" />
    </Field>
    <Field>
      <FieldLabel>12-hour</FieldLabel>
      <InputTime :default-value="value" :hour-cycle="12" />
    </Field>
  </div>
</template>
