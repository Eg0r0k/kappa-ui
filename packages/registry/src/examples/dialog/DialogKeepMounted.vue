<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { defineDialog } from "@/ui/dialog";
import FeedbackDialog from "./FeedbackDialog.vue";

const feedbackDialog = defineDialog(FeedbackDialog, { keepMounted: true });
const sent = ref<string>();

const open = async () => {
  const result = await feedbackDialog.open<string>();
  if (result.ok) sent.value = result.value;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="neutral" @click="open">Send feedback</Button>
    <p class="max-w-xs truncate text-body-md text-muted-foreground" aria-live="polite">
      {{ sent ? `Sent: “${sent}”` : "Nothing sent yet." }}
    </p>
  </div>
</template>
