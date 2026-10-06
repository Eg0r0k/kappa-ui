<script setup lang="ts">
import { FileCode, FileJson, FileText, Folder, FolderOpen } from "@lucide/vue";
import { shallowRef } from "vue";

import { Tree, TreeItem, TreeItemIcon, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

type File = { path: string; label: string; children?: File[]; defaultExpanded?: boolean };

const files: File[] = [
  {
    path: "src",
    label: "src",
    defaultExpanded: true,
    children: [
      {
        path: "src/components",
        label: "components",
        defaultExpanded: true,
        children: [
          { path: "src/components/Header.vue", label: "Header.vue" },
          { path: "src/components/Sidebar.vue", label: "Sidebar.vue" },
        ],
      },
      {
        path: "src/composables",
        label: "composables",
        children: [{ path: "src/composables/useTheme.ts", label: "useTheme.ts" }],
      },
      { path: "src/App.vue", label: "App.vue" },
      { path: "src/main.ts", label: "main.ts" },
    ],
  },
  { path: "package.json", label: "package.json" },
  { path: "README.md", label: "README.md" },
];

const iconOf = (file: File) =>
  file.label.endsWith(".json") ? FileJson : file.label.endsWith(".md") ? FileText : FileCode;

const opened = shallowRef<File>();
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <Tree v-slot="{ items }" v-model="opened" :items="files" :get-key="(file) => file.path" aria-label="Project files">
      <TreeItem v-for="row in items" :key="row._id" v-slot="{ item, expanded, hasChildren }" :item="row">
        <TreeItemToggle />
        <TreeItemIcon>
          <component :is="hasChildren ? (expanded ? FolderOpen : Folder) : iconOf(item)" />
        </TreeItemIcon>
        <TreeItemLabel>{{ item.label }}</TreeItemLabel>
      </TreeItem>
    </Tree>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ opened ? `Opened ${opened.path}` : "No file open" }}
    </p>
  </div>
</template>
