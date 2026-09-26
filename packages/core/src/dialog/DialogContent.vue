<script setup lang="ts">
import { DialogContent, type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";

import { createDialogContentParts, provideDialogContentParts } from "./context";
import DialogContentFallback from "./DialogContentFallback.vue";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);

provideDialogContentParts(createDialogContentParts());
</script>

<template>
  <DialogContent v-bind="forwarded">
    <slot />
    <DialogContentFallback />
  </DialogContent>
</template>
