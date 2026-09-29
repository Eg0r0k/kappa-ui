<script setup lang="ts">
import { ref } from "vue";

import { createDataTableColumnHelper, DataTable, type ExpandedState, type GroupingState } from "@/ui/data-table";

type Expense = { id: number; category: string; vendor: string; amount: number };

const categories = ["Travel", "Software", "Office", "Meals"];
const vendors = ["Lufthansa", "Figma", "Staples", "Deli 12", "GitHub", "Hilton", "IKEA", "Sushi Bar"];

const expenses: Expense[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  category: categories[(index * 5) % categories.length]!,
  vendor: vendors[(index * 3) % vendors.length]!,
  amount: ((index * 731) % 900) + 20,
}));

const helper = createDataTableColumnHelper<Expense>();
const columns = helper.columns([
  helper.accessor("category", { header: "Category", size: 200 }),
  helper.accessor("vendor", {
    header: "Vendor",
    aggregationFn: "unique",
    aggregatedCell: ({ getValue }) => `${getValue<string[]>().length} vendors`,
  }),
  helper.accessor("amount", {
    header: "Amount",
    size: 120,
    meta: { align: "end" },
    aggregationFn: "sum",
    cell: ({ getValue }) => `$${getValue()}`,
    aggregatedCell: ({ getValue }) => `$${getValue()}`,
  }),
]);

const grouping = ref<GroupingState>(["category"]);
const expanded = ref<ExpandedState>({});
</script>

<template>
  <DataTable
    v-model:grouping="grouping"
    v-model:expanded="expanded"
    :data="expenses"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    groupable
    sortable
    class="w-full max-w-lg"
  />
</template>
