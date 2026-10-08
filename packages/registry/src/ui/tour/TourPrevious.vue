<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";
import { injectTourContext } from ".";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    color?: ButtonColor | (string & {});
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "outline", color: "neutral", size: "sm" },
);

const { tour } = injectTourContext();
</script>

<template>
  <Button
    data-slot="tour-previous"
    :variant="props.variant"
    :color="props.color"
    :size="props.size"
    :class="props.class"
    :aria-disabled="!tour.hasPrev.value || undefined"
    @click="tour.prev()"
  >
    <slot>Back</slot>
  </Button>
</template>
