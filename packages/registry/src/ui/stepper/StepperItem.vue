<script setup lang="ts">
import { StepperItem, type StepperItemProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperItem } from ".";

const props = defineProps<StepperItemProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperItem v-slot="slotProps" v-bind="delegated" data-slot="stepper-item" :class="cn(stepperItem, props.class)">
    <slot v-bind="slotProps" />
  </StepperItem>
</template>
