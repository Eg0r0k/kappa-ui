<script setup lang="ts">
import { StepperIndicator, type StepperIndicatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperIndicator } from ".";

const props = defineProps<StepperIndicatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperIndicator
    v-slot="slotProps"
    v-bind="delegated"
    data-slot="stepper-indicator"
    :class="cn(stepperIndicator, props.class)"
  >
    <slot v-bind="slotProps" />
  </StepperIndicator>
</template>
