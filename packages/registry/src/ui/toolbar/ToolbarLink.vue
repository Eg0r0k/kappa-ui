<script setup lang="ts">
import { ToolbarLink } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";

const props = withDefaults(
  defineProps<{
    color?: ButtonColor;
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
  }>(),
  { color: "neutral", size: "sm" },
);
</script>

<template>
  <ToolbarLink as-child>
    <Button data-slot="toolbar-link" as="a" variant="link" :color="props.color" :size="props.size" :class="props.class">
      <slot />
    </Button>
  </ToolbarLink>
</template>
