<script setup lang="ts">
import { StepperDescription, type StepperDescriptionProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperDescription } from ".";

const props = defineProps<StepperDescriptionProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperDescription v-bind="delegated" data-slot="stepper-description" :class="cn(stepperDescription, props.class)">
    <slot />
  </StepperDescription>
</template>
