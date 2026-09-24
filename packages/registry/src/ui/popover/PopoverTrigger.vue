<script setup lang="ts">
import { PopoverTrigger, type PopoverTriggerProps } from "@delta-ui/core/popover";

const props = defineProps<PopoverTriggerProps>();
</script>

<template>
  <PopoverTrigger v-bind="props" data-slot="popover-trigger">
    <slot />
  </PopoverTrigger>
</template>
