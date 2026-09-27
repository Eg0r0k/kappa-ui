<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { defineDialog } from "@/ui/dialog";
import ExportDialog from "./ExportDialog.vue";

const total = 12;
const exportDialog = defineDialog(ExportDialog, { props: { done: 0, total } });
const status = ref(`${total} photos selected.`);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const start = async () => {
  const dialog = exportDialog.open();
  for (let done = 1; done <= total && dialog.isOpen.value; done += 1) {
    await wait(250);
    if (dialog.isOpen.value) dialog.patch({ done });
  }
  dialog.close();
  const result = await dialog;
  status.value = result.ok ? `${total} photos exported.` : "Export cancelled.";
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="neutral" @click="start">Export</Button>
    <p class="text-body-md text-muted-foreground" aria-live="polite">{{ status }}</p>
  </div>
</template>
