<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { openDialog } from "@/ui/dialog";
import DeleteFileDialog from "./DeleteFileDialog.vue";

const status = ref("report.pdf is in your files.");

const remove = async () => {
  const result = await openDialog(DeleteFileDialog, { name: "report.pdf" });
  status.value = result.ok ? "report.pdf was deleted." : `report.pdf was kept (${result.reason}).`;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="destructive" @click="remove">Delete file</Button>
    <p class="text-body-md text-muted-foreground" aria-live="polite">{{ status }}</p>
  </div>
</template>
