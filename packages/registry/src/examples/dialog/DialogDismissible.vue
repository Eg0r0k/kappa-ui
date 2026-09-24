<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

const attempts = ref(0);
</script>

<template>
  <Dialog
    :dismissible="false"
    :close="false"
    title="Uploading 3 files"
    description="Keep this window open until the upload finishes."
    @close:prevent="attempts += 1"
    @update:open="(open) => open && (attempts = 0)"
  >
    <Button variant="outline" color="neutral">Start upload</Button>

    <template #body>
      <p class="text-body-md text-muted-foreground" aria-live="polite">
        {{ attempts ? `Escape and outside clicks are ignored (${attempts}).` : "Try Escape or clicking outside." }}
      </p>
    </template>

    <template #footer="{ close }">
      <Button @click="close">Done</Button>
    </template>
  </Dialog>
</template>
