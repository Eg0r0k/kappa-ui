<script setup lang="ts">
import { StepperTrigger, type StepperTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperTrigger } from ".";

const props = defineProps<StepperTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperTrigger v-bind="delegated" data-slot="stepper-trigger" :class="cn(stepperTrigger, props.class)">
    <slot />
  </StepperTrigger>
</template>
