<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
</script>

<template>
  <ScrollArea
    :visible="true"
    class="h-64 w-full max-w-sm rounded-lg border [&_[data-slot=scroll-area-thumb]]:bg-primary/60"
  >
    <div class="p-4">
      <p v-for="index in 30" :key="index" class="text-body-md leading-7">Restyled thumb. Line {{ index }}</p>
    </div>
  </ScrollArea>
</template>
