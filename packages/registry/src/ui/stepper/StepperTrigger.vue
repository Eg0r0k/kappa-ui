<script setup lang="ts">
import { StepperTrigger, type StepperTriggerProps, injectStepperRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { stepperTriggerVariants } from ".";

const props = defineProps<StepperTriggerProps & { class?: HTMLAttributes["class"] }>();

const root = injectStepperRootContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <StepperTrigger
    v-bind="delegated"
    data-slot="stepper-trigger"
    :class="cn(stepperTriggerVariants({ orientation: root.orientation.value }), props.class)"
  >
    <slot />
  </StepperTrigger>
</template>
