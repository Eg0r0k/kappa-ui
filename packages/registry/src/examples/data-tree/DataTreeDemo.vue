<script setup lang="ts">
import { FileCode, FileJson, FileText, Folder } from "@lucide/vue";
import { shallowRef } from "vue";

import { DataTree } from "@/ui/data-tree";
import type { TreeNode } from "@/ui/tree";

defineOptions({ inheritAttrs: false });

const files: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: Folder,
    defaultExpanded: true,
    children: [
      {
        id: "src/components",
        label: "components",
        icon: Folder,
        children: [
          { id: "src/components/Header.vue", label: "Header.vue", icon: FileCode },
          { id: "src/components/Sidebar.vue", label: "Sidebar.vue", icon: FileCode },
        ],
      },
      { id: "src/App.vue", label: "App.vue", icon: FileCode },
      { id: "src/main.ts", label: "main.ts", icon: FileCode },
    ],
  },
  { id: "package.json", label: "package.json", icon: FileJson },
  { id: "README.md", label: "README.md", icon: FileText },
];

const opened = shallowRef<TreeNode>();
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <DataTree v-model="opened" :items="files" variant="outline" aria-label="Project files" v-bind="$attrs" />
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ opened ? `Opened ${opened.id}` : "No file open" }}
    </p>
  </div>
</template>
