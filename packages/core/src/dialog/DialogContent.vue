<script setup lang="ts">
import { DialogContent, type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";

import DialogContentFallback from "./DialogContentFallback.vue";
import { useDialogContentDuties } from "./duties";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const { onEscapeKeyDown, onInteractOutside, onAfterLeave } = useDialogContentDuties();
</script>

<template>
  <DialogContent
    v-bind="forwarded"
    @escape-key-down="onEscapeKeyDown"
    @interact-outside="onInteractOutside"
    @after-leave="onAfterLeave"
  >
    <slot />
    <DialogContentFallback />
  </DialogContent>
</template>
