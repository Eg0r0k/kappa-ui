<script setup lang="ts">
import { FileCode, Folder, FolderOpen } from "@lucide/vue";

import { Tree, TreeItem, TreeItemIcon, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

type Status = "M" | "A" | "D";
type Change = { path: string; label: string; status?: Status; children?: Change[]; defaultExpanded?: boolean };

const changes: Change[] = [
  {
    path: "src",
    label: "src",
    defaultExpanded: true,
    children: [
      { path: "src/router.ts", label: "router.ts", status: "M" },
      { path: "src/session.ts", label: "session.ts", status: "A" },
      { path: "src/legacy-auth.ts", label: "legacy-auth.ts", status: "D" },
    ],
  },
  { path: "package.json", label: "package.json", status: "M" },
];

const tone: Record<Status, string> = {
  M: "text-warning-text",
  A: "text-success-text",
  D: "text-destructive",
};

const statusName: Record<Status, string> = { M: "modified", A: "added", D: "deleted" };

const count = (change: Change): number =>
  change.children ? change.children.reduce((sum, child) => sum + count(child), 0) : change.status ? 1 : 0;
</script>

<template>
  <Tree
    v-slot="{ items }"
    :items="changes"
    :get-key="(change) => change.path"
    variant="outline"
    aria-label="Changes"
    class="w-72"
  >
    <TreeItem v-for="row in items" :key="row._id" v-slot="{ item, hasChildren, expanded }" :item="row">
      <TreeItemToggle />
      <TreeItemIcon>
        <component :is="hasChildren ? (expanded ? FolderOpen : Folder) : FileCode" />
      </TreeItemIcon>
      <TreeItemLabel :class="item.status === 'D' && 'line-through'">{{ item.label }}</TreeItemLabel>
      <span v-if="item.children" class="text-label-md text-muted-foreground">{{ count(item) }}</span>
      <span v-else-if="item.status" :class="['text-label-md font-medium', tone[item.status]]">
        <span aria-hidden="true">{{ item.status }}</span>
        <span class="sr-only">{{ statusName[item.status] }}</span>
      </span>
    </TreeItem>
  </Tree>
</template>
