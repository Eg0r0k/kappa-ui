<script setup lang="ts">
import { Tree, TreeItem, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

const plans = [
  {
    id: "free",
    label: "Free",
    children: [
      { id: "free.projects", label: "3 projects" },
      { id: "free.sso", label: "Single sign-on", disabled: true },
    ],
  },
  { id: "team", label: "Team" },
  { id: "enterprise", label: "Enterprise (contact sales)", disabled: true },
];
</script>

<template>
  <div class="flex flex-wrap items-start gap-6">
    <Tree
      :items="plans"
      :default-expanded="['free']"
      variant="outline"
      aria-label="Plans"
      class="w-60"
      v-slot="{ items }"
    >
      <TreeItem v-for="row in items" :key="row._id" :item="row">
        <TreeItemToggle />
        <TreeItemLabel>{{ row.value.label }}</TreeItemLabel>
      </TreeItem>
    </Tree>
    <Tree
      :items="plans"
      :default-expanded="['free']"
      variant="outline"
      disabled
      aria-label="Plans, locked"
      class="w-60"
      v-slot="{ items }"
    >
      <TreeItem v-for="row in items" :key="row._id" :item="row">
        <TreeItemToggle />
        <TreeItemLabel>{{ row.value.label }}</TreeItemLabel>
      </TreeItem>
    </Tree>
  </div>
</template>
