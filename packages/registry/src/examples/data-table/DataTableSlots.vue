<script setup lang="ts">
import { ref } from "vue";

import { Badge } from "@/ui/badge";
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";
import { Input } from "@/ui/input";

type Task = { id: number; title: string; owner: string; priority: "low" | "medium" | "high"; notes: string };

const tasks: Task[] = [
  {
    id: 1,
    title: "Ship the data table",
    owner: "Ada",
    priority: "high",
    notes: "Sorting, pinning and virtualization are in; selection lands with the next stage.",
  },
  {
    id: 2,
    title: "Write the docs page",
    owner: "Grace",
    priority: "medium",
    notes: "Cover the slots and the state models.",
  },
  { id: 3, title: "Record the screencast", owner: "Linus", priority: "low", notes: "Two minutes, no narration." },
  {
    id: 4,
    title: "Review the a11y pass",
    owner: "Katherine",
    priority: "high",
    notes: "aria-rowcount with virtualization, the focused row stays mounted, scroll padding under the header.",
  },
];

const search = ref("");

const helper = createDataTableColumnHelper<Task>();
const columns = helper.columns([
  helper.accessor("title", { header: "Task", size: 220 }),
  helper.accessor("owner", { header: "Owner", size: 120 }),
  helper.accessor("priority", { header: "Priority", size: 110, meta: { align: "center" } }),
  helper.accessor("notes", { header: "Notes", size: 260, meta: { truncate: true } }),
]);

const color = (priority: Task["priority"]) =>
  priority === "high" ? "destructive" : priority === "medium" ? "warning" : "neutral";
</script>

<template>
  <DataTable
    v-model:global-filter="search"
    :data="tasks"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    class="w-full max-w-2xl"
  >
    <template #toolbar>
      <Input v-model="search" placeholder="Filter tasks…" class="max-w-64" />
    </template>
    <template #header-owner="{ column }">
      <span class="text-muted-foreground italic">{{ column.columnDef.header }}</span>
    </template>
    <template #cell-priority="{ getValue }">
      <Badge variant="soft" :color="color(getValue() as Task['priority'])">{{ getValue() }}</Badge>
    </template>
  </DataTable>
</template>
