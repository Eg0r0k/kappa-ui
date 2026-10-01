<script setup lang="ts">
import { StepperTitle, type StepperTitleProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperTitle } from ".";

const props = defineProps<StepperTitleProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperTitle v-bind="delegated" data-slot="stepper-title" :class="cn(stepperTitle, props.class)">
    <slot />
  </StepperTitle>
</template>
