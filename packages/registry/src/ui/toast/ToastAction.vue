<script setup lang="ts">
import { ToastAction } from "@kappa-ui/core/toast";
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";

const props = withDefaults(
  defineProps<{
    altText: string;
    variant?: ButtonVariants["variant"];
    color?: ButtonColor | (string & {});
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "soft", color: "neutral", size: "xs" },
);
</script>

<template>
  <ToastAction :alt-text="props.altText" as-child>
    <Button
      data-slot="toast-action"
      :variant="props.variant"
      :color="props.color"
      :size="props.size"
      :class="props.class"
    >
      <slot />
    </Button>
  </ToastAction>
</template>
