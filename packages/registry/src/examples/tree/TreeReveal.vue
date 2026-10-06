<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef } from "vue";

import { Button } from "@/ui/button";
import { Tree, flattenTree, getAncestorKeys } from "@/ui/tree";

type Page = { path: string; label: string; children?: Page[] };

const docs: Page[] = [
  {
    path: "/guide",
    label: "Guide",
    children: [
      { path: "/guide/install", label: "Installation" },
      {
        path: "/guide/theming",
        label: "Theming",
        children: [
          { path: "/guide/theming/colors", label: "Colors" },
          { path: "/guide/theming/dark-mode", label: "Dark mode" },
        ],
      },
    ],
  },
  {
    path: "/components",
    label: "Components",
    children: [
      { path: "/components/button", label: "Button" },
      { path: "/components/tree", label: "Tree" },
    ],
  },
];

const getKey = (page: Page) => page.path;
const tree = useTemplateRef("tree");
const expanded = shallowRef<string[]>([]);
const current = shallowRef<Page>();

// The page the router is on, say. Selecting it works while it's hidden; revealing opens its ancestors.
const reveal = async (path: string) => {
  current.value = flattenTree(docs).find((page) => page.path === path);
  expanded.value = [...new Set([...expanded.value, ...getAncestorKeys(docs, path, { getKey })])];
  await nextTick();
  tree.value?.scrollToKey(path);
};
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" color="neutral" @click="tree?.expandAll()">Expand all</Button>
      <Button size="sm" variant="outline" color="neutral" @click="tree?.collapseAll()">Collapse all</Button>
      <Button size="sm" @click="reveal('/guide/theming/dark-mode')">Reveal Dark mode</Button>
    </div>
    <Tree
      ref="tree"
      v-model="current"
      v-model:expanded="expanded"
      :items="docs"
      :get-key="getKey"
      selection-behavior="replace"
      variant="outline"
      aria-label="Docs"
    />
  </div>
</template>
