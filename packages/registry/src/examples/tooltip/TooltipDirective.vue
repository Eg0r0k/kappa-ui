<script setup lang="ts">
import { Settings } from "@lucide/vue";

import { Button } from "@/ui/button";
import { vTooltip } from "@/ui/tooltip";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button v-tooltip="'Save changes'" variant="outline">Save</Button>
    <Button v-tooltip:bottom="'Opens below'" variant="outline">Bottom</Button>
    <Button v-tooltip="{ content: 'No delay, on the right', side: 'right', delay: 0 }" variant="outline"
      >Options</Button
    >
    <Button v-tooltip.label="'Settings'" variant="ghost" color="neutral" size="icon-md">
      <Settings />
    </Button>
  </div>
</template>
