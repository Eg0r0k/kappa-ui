<script setup lang="ts">
import { Time } from "@internationalized/date";
import type { TimeValue } from "reka-ui";
import { shallowRef } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { InputTimeRange } from "@/ui/input-time";

const hours = shallowRef<{ start: TimeValue | undefined; end: TimeValue | undefined }>({
  start: new Time(9, 0),
  end: new Time(17, 30),
});
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Opening hours</FieldLabel>
    <InputTimeRange v-model="hours" :hour-cycle="24" />
  </Field>
</template>
