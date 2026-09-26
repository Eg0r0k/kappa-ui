<script setup lang="ts">
import { DialogDescription, DialogTitle, VisuallyHidden } from "reka-ui";

import { injectDialogContentParts } from "./context";

const { titles, descriptions } = injectDialogContentParts();
</script>

<template>
  <VisuallyHidden v-if="titles === 0 || descriptions === 0">
    <DialogTitle v-if="titles === 0" />
    <DialogDescription v-if="descriptions === 0" />
  </VisuallyHidden>
</template>
