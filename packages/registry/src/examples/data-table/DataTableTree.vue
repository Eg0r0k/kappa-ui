<script setup lang="ts">
import { ref } from "vue";

import { createDataTableColumnHelper, DataTable, type ExpandedState } from "@/ui/data-table";

type Entry = { path: string; name: string; kind: "folder" | "file"; size: number; children?: Entry[] };

const folder = (path: string, name: string, children: Entry[]): Entry => ({
  path,
  name,
  kind: "folder",
  size: children.reduce((sum, child) => sum + child.size, 0),
  children,
});
const file = (path: string, name: string, size: number): Entry => ({ path, name, kind: "file", size });

const tree: Entry[] = [
  folder("src", "src", [
    folder("src/ui", "ui", [
      file("src/ui/button.vue", "button.vue", 2_140),
      file("src/ui/table.vue", "table.vue", 3_980),
      file("src/ui/data-table.vue", "data-table.vue", 18_420),
    ]),
    folder("src/lib", "lib", [file("src/lib/utils.ts", "utils.ts", 310)]),
    file("src/main.ts", "main.ts", 480),
  ]),
  folder("docs", "docs", [file("docs/index.md", "index.md", 1_200), file("docs/table.md", "table.md", 6_700)]),
  file("package.json", "package.json", 890),
];

const format = (bytes: number) => (bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`);

const helper = createDataTableColumnHelper<Entry>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("kind", { header: "Kind", size: 100 }),
  helper.accessor("size", {
    header: "Size",
    size: 110,
    meta: { align: "end" },
    cell: ({ getValue }) => format(getValue()),
  }),
]);

const expanded = ref<ExpandedState>({ src: true });
</script>

<template>
  <DataTable
    v-model:expanded="expanded"
    :data="tree"
    :columns="columns"
    :get-row-id="(row) => row.path"
    :get-sub-rows="(row) => row.children"
    expandable
    class="w-full max-w-lg"
  />
</template>
