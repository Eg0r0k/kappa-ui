<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { defineDialog } from "@/ui/dialog";
import RenameDialog from "./RenameDialog.vue";

const renameDialog = defineDialog(RenameDialog);
const name = ref("Aurora");

const rename = async () => {
  const result = await renameDialog.open<string>({ name: name.value });
  if (result.ok) name.value = result.value;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <p class="text-title-md">{{ name }}</p>
    <Button variant="outline" color="neutral" @click="rename">Rename</Button>
  </div>
</template>
