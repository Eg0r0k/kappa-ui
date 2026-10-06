<script setup lang="ts">
import { Tree } from "@/ui/tree";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

const items = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "tokens", label: "Tokens" },
      { id: "icons", label: "Icons" },
    ],
  },
  { id: "notes", label: "Notes" },
];
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <Tree
      v-for="size in sizes"
      :key="size"
      :size="size"
      :items="items"
      :default-expanded="['design']"
      variant="outline"
      :aria-label="`Folders, ${size}`"
      class="w-40"
    />
  </div>
</template>
