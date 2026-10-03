<script setup lang="ts">
import { Time, getLocalTimeZone, now, toTime } from "@internationalized/date";
import { Clock } from "@lucide/vue";
import type { TimeValue } from "reka-ui";
import { shallowRef } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/ui/input-group";
import { InputTime } from "@/ui/input-time";

const time = shallowRef<TimeValue | undefined>(new Time(9, 30));
const setNow = () => {
  time.value = toTime(now(getLocalTimeZone()));
};
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Reminder</FieldLabel>
    <InputGroup>
      <InputGroupAddon>
        <Clock />
      </InputGroupAddon>
      <InputTime v-model="time" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton @click="setNow">Now</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </Field>
</template>
