<script setup lang="ts">
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
</script>

<template>
  <Dialog fullscreen title="Compose" description="Write a new message.">
    <Button variant="outline" color="neutral">Open fullscreen</Button>

    <template #body>
      <p class="text-body-md text-muted-foreground">The dialog fills the window, which suits editors and phones.</p>
    </template>

    <template #footer="{ close }">
      <Button @click="close">Send</Button>
    </template>
  </Dialog>
</template>
