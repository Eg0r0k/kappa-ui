<script setup lang="ts">
import { Time } from "@internationalized/date";
import type { TimeValue } from "reka-ui";
import { shallowRef } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

defineOptions({ inheritAttrs: false });

const time = shallowRef<TimeValue | undefined>(new Time(9, 30));
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Start time</FieldLabel>
    <InputTime v-model="time" v-bind="$attrs" />
    <FieldDescription>Selected: {{ time?.toString() ?? "none" }}</FieldDescription>
  </Field>
</template>
