<script setup lang="ts">
import { AlertDialogAction } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { Button, type ButtonColor, type ButtonVariants } from "@/ui/button";

const props = defineProps<{
  variant?: ButtonVariants["variant"];
  color?: ButtonColor | (string & {});
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <AlertDialogAction as-child>
    <Button
      data-slot="alert-dialog-action"
      :variant="props.variant"
      :color="props.color"
      :size="props.size"
      :class="props.class"
    >
      <slot />
    </Button>
  </AlertDialogAction>
</template>
