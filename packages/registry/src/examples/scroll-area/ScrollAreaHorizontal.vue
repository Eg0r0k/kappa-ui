<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
</script>

<template>
  <ScrollArea orientation="horizontal" class="h-44 w-full max-w-md rounded-lg border">
    <div class="flex w-max gap-3 p-4">
      <div
        v-for="index in 12"
        :key="index"
        class="grid size-32 shrink-0 place-items-center rounded-lg bg-accent text-body-md text-accent-foreground"
      >
        {{ index }}
      </div>
    </div>
  </ScrollArea>
</template>
