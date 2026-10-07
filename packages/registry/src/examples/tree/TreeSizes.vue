<script setup lang="ts">
import { Tree, TreeItem, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

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
      v-slot="{ items: rows }"
      :size="size"
      :items="items"
      :default-expanded="['design']"
      variant="outline"
      :aria-label="`Folders, ${size}`"
      class="w-40"
    >
      <TreeItem v-for="row in rows" :key="row._id" :item="row">
        <TreeItemToggle />
        <TreeItemLabel>{{ row.value.label }}</TreeItemLabel>
      </TreeItem>
    </Tree>
  </div>
</template>
