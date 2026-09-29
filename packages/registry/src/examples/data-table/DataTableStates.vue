<script setup lang="ts">
import { computed, ref } from "vue";

import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

type Invoice = { id: string; customer: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1", customer: "Ada Lovelace", amount: 250 },
  { id: "INV-2", customer: "Grace Hopper", amount: 150 },
  { id: "INV-3", customer: "Linus Torvalds", amount: 350 },
];

type State = "data" | "loading" | "empty" | "filtered";
const state = ref<State>("data");
const setState = (value: unknown) => {
  if (value === "data" || value === "loading" || value === "empty" || value === "filtered") state.value = value;
};

const data = computed(() => (state.value === "data" || state.value === "filtered" ? invoices : []));
const filter = computed(() => (state.value === "filtered" ? "nobody" : ""));

const helper = createDataTableColumnHelper<Invoice>();
const columns = helper.columns([
  helper.accessor("id", { header: "Invoice", size: 110 }),
  helper.accessor("customer", { header: "Customer" }),
  helper.accessor("amount", {
    header: "Amount",
    size: 110,
    meta: { align: "end" },
    cell: ({ getValue }) => `$${getValue()}`,
  }),
]);
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <ToggleGroup type="single" variant="outline" size="sm" :model-value="state" @update:model-value="setState">
      <ToggleGroupItem value="data">Data</ToggleGroupItem>
      <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
      <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
      <ToggleGroupItem value="filtered">No results</ToggleGroupItem>
    </ToggleGroup>
    <DataTable
      :data="data"
      :columns="columns"
      :get-row-id="(row) => row.id"
      :loading="state === 'loading'"
      :global-filter="filter"
      :loading-rows="3"
      class="rounded-lg border"
    >
      <template #empty>No invoices yet.</template>
      <template #noResults>Nothing matches your search.</template>
    </DataTable>
  </div>
</template>
