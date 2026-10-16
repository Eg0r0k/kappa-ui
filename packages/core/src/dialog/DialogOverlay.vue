<script setup lang="ts">
import { DialogOverlay, type DialogOverlayProps } from "reka-ui";

import { useScrollLockGutter } from "../overlay/scroll-lock-gutter";

const props = defineProps<DialogOverlayProps>();

useScrollLockGutter();
</script>

<template>
  <DialogOverlay v-bind="props">
    <slot />
  </DialogOverlay>
</template>
