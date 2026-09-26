<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from "reka-ui";
import { onUnmounted } from "vue";

import { createDialogContentParts, injectDialogContentParts } from "./context";

const props = defineProps<DialogDescriptionProps>();

const { descriptions } = injectDialogContentParts(createDialogContentParts());
descriptions.value += 1;
onUnmounted(() => {
  descriptions.value -= 1;
});
</script>

<template>
  <DialogDescription v-bind="props">
    <slot />
  </DialogDescription>
</template>
