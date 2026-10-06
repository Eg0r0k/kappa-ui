<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { DatePicker } from "@/ui/date-picker";
import { Field, FieldLabel } from "@/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText } from "@/ui/input-group";

const from = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 6));
</script>

<template>
  <Field class="w-full max-w-72">
    <FieldLabel>Valid from</FieldLabel>
    <InputGroup variant="soft">
      <InputGroupAddon>
        <InputGroupText>Starts</InputGroupText>
      </InputGroupAddon>
      <DatePicker v-model="from" locale="en-US" />
    </InputGroup>
  </Field>
</template>
