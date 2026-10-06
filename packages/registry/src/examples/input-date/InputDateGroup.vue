<script setup lang="ts">
import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/ui/input-group";

const due = shallowRef<DateValue | undefined>();
const setToday = () => {
  due.value = today(getLocalTimeZone());
};
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Due date</FieldLabel>
    <InputGroup>
      <InputGroupAddon>
        <CalendarDays />
      </InputGroupAddon>
      <InputDate v-model="due" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton @click="setToday">Today</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </Field>
</template>
