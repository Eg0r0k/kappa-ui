<script setup lang="ts">
import { StepperSeparator, type StepperSeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperSeparator } from ".";

const props = defineProps<StepperSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperSeparator v-bind="delegated" data-slot="stepper-separator" :class="cn(stepperSeparator, props.class)" />
</template>
