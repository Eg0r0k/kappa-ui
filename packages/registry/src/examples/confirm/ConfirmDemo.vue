<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { useConfirm } from "@/ui/confirm";

const { confirm } = useConfirm();
const status = ref("The draft is open.");

const discard = async () => {
  const result = await confirm({
    title: "Discard the draft?",
    description: "Your unsaved changes will be lost.",
    action: "Discard",
    color: "destructive",
  });
  status.value = result.ok ? "The draft was discarded." : `The draft was kept (${result.reason}).`;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="neutral" @click="discard">Discard draft</Button>
    <p class="text-body-md text-muted-foreground" aria-live="polite">{{ status }}</p>
  </div>
</template>
