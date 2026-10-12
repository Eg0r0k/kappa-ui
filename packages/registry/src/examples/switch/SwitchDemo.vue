<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Field orientation="horizontal" class="w-auto">
    <Switch v-bind="$attrs" />
    <FieldLabel>Airplane mode</FieldLabel>
  </Field>
</template>
