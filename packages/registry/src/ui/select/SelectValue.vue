<script setup lang="ts">
import { SelectValue, type SelectValueProps } from "@kappa-ui/core/select";

const props = defineProps<SelectValueProps>();
</script>

<template>
  <SelectValue v-slot="slotProps" v-bind="props" data-slot="select-value">
    <slot v-bind="slotProps" />
  </SelectValue>
</template>
