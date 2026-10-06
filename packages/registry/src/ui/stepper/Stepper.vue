<script setup lang="ts">
import { StepperRoot, type StepperRootEmits, type StepperRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type StepperColor, type StepperVariants, stepperVariants } from ".";

const props = withDefaults(
  defineProps<
    StepperRootProps & {
      /** The tone of the active step's indicator. */
      color?: StepperColor | (string & {});
      size?: StepperVariants["size"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { color: "primary", size: "md" },
);
const emits = defineEmits<StepperRootEmits>();

const delegated = computed(() => {
  const { class: _, size: __, color: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <StepperRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="stepper"
    :data-color="props.color"
    :data-size="props.size"
    :class="cn(stepperVariants({ size: props.size }), props.class)"
  >
    <slot v-bind="slotProps" />
  </StepperRoot>
</template>
