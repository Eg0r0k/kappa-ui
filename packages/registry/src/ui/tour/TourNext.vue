<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonSize, type ButtonVariants } from "@/ui/button";
import { injectTourContext } from ".";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    color?: ButtonColor | (string & {});
    size?: ButtonSize;
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "solid", color: "primary", size: "sm" },
);

defineSlots<{ default?: (props: { hasNext: boolean }) => unknown }>();

const { tour } = injectTourContext();
</script>

<template>
  <Button
    data-slot="tour-next"
    :variant="props.variant"
    :color="props.color"
    :size="props.size"
    :class="props.class"
    @click="tour.next()"
  >
    <slot :has-next="tour.hasNext.value">{{ tour.hasNext.value || tour.loop ? "Next" : "Finish" }}</slot>
  </Button>
</template>
