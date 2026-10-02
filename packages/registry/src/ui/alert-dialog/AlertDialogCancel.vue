<script setup lang="ts">
import { AlertDialogCancel } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    color?: ButtonColor | (string & {});
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "outline", color: "neutral" },
);
</script>

<template>
  <AlertDialogCancel as-child>
    <Button
      data-slot="alert-dialog-cancel"
      :variant="props.variant"
      :color="props.color"
      :size="props.size"
      :class="props.class"
    >
      <slot />
    </Button>
  </AlertDialogCancel>
</template>
