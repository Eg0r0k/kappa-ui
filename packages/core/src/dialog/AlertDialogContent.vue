<script setup lang="ts">
import {
  AlertDialogContent,
  type AlertDialogContentEmits,
  type AlertDialogContentProps,
  useForwardPropsEmits,
} from "reka-ui";

import DialogContentFallback from "./DialogContentFallback.vue";
import { useDialogContentDuties } from "./duties";

const props = defineProps<AlertDialogContentProps>();
const emits = defineEmits<AlertDialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const { onEscapeKeyDown, onAfterLeave } = useDialogContentDuties();
</script>

<template>
  <AlertDialogContent v-bind="forwarded" @escape-key-down="onEscapeKeyDown" @after-leave="onAfterLeave">
    <slot />
    <DialogContentFallback />
  </AlertDialogContent>
</template>
