<script setup lang="ts">
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

const changes = Array.from({ length: 30 }, (_, index) => `Change ${index + 1}: fixed a layout shift in the settings panel.`);
</script>

<template>
  <Dialog scrollable title="Release notes" description="Version 2.4, everything that changed.">
    <Button variant="outline" color="neutral">Open release notes</Button>

    <template #body>
      <ul class="flex list-disc flex-col gap-2 ps-5 text-body-md">
        <li v-for="change in changes" :key="change">{{ change }}</li>
      </ul>
    </template>
  </Dialog>
</template>
