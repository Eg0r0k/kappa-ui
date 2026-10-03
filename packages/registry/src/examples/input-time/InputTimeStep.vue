<script setup lang="ts">
import { Time } from "@internationalized/date";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const value = new Time(10, 15);
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Meeting slot</FieldLabel>
    <InputTime :default-value="value" :step="{ minute: 15 }" step-snapping :hour-cycle="24" />
    <FieldDescription>The arrow keys move the minutes by 15.</FieldDescription>
  </Field>
</template>
