<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { useConfirm } from "@/ui/confirm";

const { prompt } = useConfirm();
const name = ref("Aurora");

const rename = async () => {
  const result = await prompt({
    title: "Rename project",
    label: "Name",
    defaultValue: name.value,
    action: "Rename",
    validate: (value) => {
      if (!value.trim()) return "Enter a name.";
      if (value.trim().length > 24) return "Use 24 characters or fewer.";
      return undefined;
    },
  });
  if (result.ok) name.value = result.value.trim();
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <p class="text-title-md">{{ name }}</p>
    <Button variant="outline" color="neutral" @click="rename">Rename</Button>
  </div>
</template>
