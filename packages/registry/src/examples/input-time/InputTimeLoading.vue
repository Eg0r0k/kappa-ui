<script setup lang="ts">
import { Time } from "@internationalized/date";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

const value = new Time(18, 0);
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Table for two</FieldLabel>
    <InputTime :default-value="value" loading />
    <FieldDescription>Checking availability…</FieldDescription>
  </Field>
</template>
