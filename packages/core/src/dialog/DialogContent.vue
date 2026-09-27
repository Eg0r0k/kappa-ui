<script setup lang="ts">
import { DialogContent, type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";
import { onMounted, onUnmounted } from "vue";

import { createDialogContentParts, provideDialogContentParts } from "./context";
import DialogContentFallback from "./DialogContentFallback.vue";
import { useOwnDialogEntry } from "./entry";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const owner = useOwnDialogEntry();

provideDialogContentParts(createDialogContentParts());

const onEscapeKeyDown = (event: KeyboardEvent) => {
  if (event.isComposing || owner?.entry.loading) event.preventDefault();
  if (owner && !event.defaultPrevented) owner.entry.reason = "escape";
};

const onInteractOutside = (event: Event) => {
  if (owner?.entry.loading) event.preventDefault();
  if (owner && !event.defaultPrevented) owner.entry.reason = "outside";
};

const onAfterLeave = () => {
  if (owner) owner.store.afterLeave(owner.entry);
};

onMounted(() => {
  if (owner) owner.store.mountContent(owner.entry);
});

onUnmounted(() => {
  if (owner) owner.store.unmountContent(owner.entry);
});
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
