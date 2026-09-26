<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from "reka-ui";
import { onUnmounted } from "vue";

import { createDialogContentParts, injectDialogContentParts } from "./context";

const props = defineProps<DialogTitleProps>();

const { titles } = injectDialogContentParts(createDialogContentParts());
titles.value += 1;
onUnmounted(() => {
  titles.value -= 1;
});
</script>

<template>
  <DialogTitle v-bind="props">
    <slot />
  </DialogTitle>
</template>
