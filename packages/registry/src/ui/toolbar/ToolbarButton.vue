<script setup lang="ts">
import { ToolbarButton } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    color?: ButtonColor;
    size?: ButtonVariants["size"];
    disabled?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "ghost", color: "neutral", size: "sm" },
);
</script>

<template>
  <ToolbarButton as-child :disabled="props.disabled">
    <Button
      data-slot="toolbar-button"
      :variant="props.variant"
      :color="props.color"
      :size="props.size"
      :disabled="props.disabled"
      :class="props.class"
    >
      <slot />
    </Button>
  </ToolbarButton>
</template>
