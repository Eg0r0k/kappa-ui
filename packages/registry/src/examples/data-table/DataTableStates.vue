<script setup lang="ts">
import { RotateCw } from "@lucide/vue";
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/ui/error-state";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

type Invoice = { id: string; customer: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1", customer: "Ada Lovelace", amount: 250 },
  { id: "INV-2", customer: "Grace Hopper", amount: 150 },
  { id: "INV-3", customer: "Linus Torvalds", amount: 350 },
];

const states = ["data", "loading", "empty", "filtered", "error"] as const;
type State = (typeof states)[number];
const state = ref<State>("data");
const setState = (value: unknown) => {
  const next = states.find((candidate) => candidate === value);
  if (next) state.value = next;
};

const data = computed(() => (state.value === "data" || state.value === "filtered" ? invoices : []));
const filter = computed(() => (state.value === "filtered" ? "nobody" : ""));

const retry = () => {
  state.value = "loading";
  setTimeout(() => (state.value = "data"), 1000);
};

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
      <ToggleGroupItem value="error">Error</ToggleGroupItem>
    </ToggleGroup>
    <DataTable
      :data="data"
      :columns="columns"
      :get-row-id="(row) => row.id"
      :loading="state === 'loading'"
      :error="state === 'error'"
      :global-filter="filter"
      :loading-rows="3"
      class="rounded-lg border"
    >
      <template #empty>No invoices yet.</template>
      <template #noResults>Nothing matches your search.</template>
      <template #error>
        <ErrorState size="sm" class="p-0 text-foreground">
          <ErrorStateHeader>
            <ErrorStateMedia />
            <ErrorStateTitle>Couldn't load invoices</ErrorStateTitle>
            <ErrorStateDescription>Check your connection and try again.</ErrorStateDescription>
          </ErrorStateHeader>
          <ErrorStateActions>
            <Button variant="outline" color="neutral" size="sm" @click="retry">
              <RotateCw data-icon="inline-start" />
              Retry
            </Button>
          </ErrorStateActions>
        </ErrorState>
      </template>
    </DataTable>
  </div>
</template>
