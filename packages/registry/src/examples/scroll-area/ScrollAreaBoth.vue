<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";

const rows = Array.from({ length: 12 }, (_, row) =>
  Array.from({ length: 12 }, (_, column) => `${row + 1}:${column + 1}`),
);
</script>

<template>
  <ScrollArea orientation="both" class="h-64 w-full max-w-md rounded-lg border">
    <div class="grid w-max grid-cols-[repeat(12,6rem)] gap-2 p-4">
      <template v-for="(row, index) in rows" :key="index">
        <div
          v-for="cell in row"
          :key="cell"
          class="grid h-16 place-items-center rounded-lg bg-accent text-body-md text-accent-foreground"
        >
          {{ cell }}
        </div>
      </template>
    </div>
  </ScrollArea>
</template>
