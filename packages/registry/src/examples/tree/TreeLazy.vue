<script setup lang="ts">
import { File, Folder } from "@lucide/vue";
import { shallowRef } from "vue";

import { Tree, TreeItem, TreeItemIcon, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

type Entry = { key: string; label: string; icon: typeof File; children?: Entry[]; loading?: boolean };

// Stands in for a listObjects call: a folder lists two subfolders and three files after a short wait.
const list = (prefix: string) =>
  new Promise<Entry[]>((resolve) =>
    setTimeout(
      () =>
        resolve([
          ...["assets", "backups"].map((name) => ({
            key: `${prefix}${name}/`,
            label: name,
            icon: Folder,
            children: [],
          })),
          ...["index.html", "robots.txt", "sitemap.xml"].map((name) => ({
            key: `${prefix}${name}`,
            label: name,
            icon: File,
          })),
        ]),
      800,
    ),
  );

// `children: []` marks a folder that is not loaded yet: it gets a chevron and aria-expanded.
const bucket = shallowRef<Entry[]>([{ key: "site/", label: "site", icon: Folder, children: [] }]);
const loaded = new Set<string>();

const update = (nodes: Entry[], key: string, patch: Partial<Entry>): Entry[] =>
  nodes.map((node) =>
    node.key === key
      ? { ...node, ...patch }
      : node.children
        ? { ...node, children: update(node.children, key, patch) }
        : node,
  );

const load = async (expanded: string[]) => {
  for (const key of expanded.filter((key) => !loaded.has(key))) {
    loaded.add(key);
    bucket.value = update(bucket.value, key, { loading: true });
    const children = await list(key);
    bucket.value = update(bucket.value, key, { loading: false, children });
  }
};
</script>

<template>
  <Tree
    :items="bucket"
    :get-key="(entry) => entry.key"
    variant="outline"
    aria-label="Bucket"
    class="w-full max-w-xs"
    @update:expanded="load"
    v-slot="{ items }"
  >
    <TreeItem v-for="row in items" :key="row._id" :item="row">
      <TreeItemToggle />
      <TreeItemIcon v-if="row.value.icon"><component :is="row.value.icon" /></TreeItemIcon>
      <TreeItemLabel>{{ row.value.label }}</TreeItemLabel>
    </TreeItem>
  </Tree>
</template>
