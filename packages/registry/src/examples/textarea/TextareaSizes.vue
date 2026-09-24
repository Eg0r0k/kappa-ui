<script setup lang="ts">
import { Textarea } from "@/ui/textarea";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Textarea
      v-for="size in sizes"
      :key="size"
      :size="size"
      :rows="2"
      :placeholder="size"
      :aria-label="`Note, ${size}`"
    />
  </div>
</template>
