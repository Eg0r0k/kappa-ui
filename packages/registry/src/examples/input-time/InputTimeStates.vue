<script setup lang="ts">
import { Time } from "@internationalized/date";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const value = new Time(9, 30);
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-2">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <InputTime :default-value="value" />
    </Field>
    <Field>
      <FieldLabel>Read only</FieldLabel>
      <InputTime :default-value="value" readonly />
      <FieldDescription>Focusable, not editable.</FieldDescription>
    </Field>
  </div>
</template>
