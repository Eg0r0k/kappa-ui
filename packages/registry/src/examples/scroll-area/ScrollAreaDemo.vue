<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
</script>

<template>
  <ScrollArea class="h-64 w-full max-w-sm rounded-lg border">
    <div class="p-4">
      <p v-for="index in 30" :key="index" class="text-sm leading-7">Line {{ index }}</p>
    </div>
  </ScrollArea>
</template>
