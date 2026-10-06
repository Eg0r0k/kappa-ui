<script setup lang="ts">
import { ref } from "vue";

import { createDataTableColumnHelper, DataTable, type DataTableRow } from "@/ui/data-table";

type Trade = { id: number; symbol: string; side: "buy" | "sell"; qty: number; price: number };

const symbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOG", "META", "TSLA", "AVGO"];
const trades: Trade[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  symbol: symbols[index % symbols.length]!,
  side: index % 3 === 0 ? "sell" : "buy",
  qty: ((index * 37) % 900) + 100,
  price: 100 + ((index * 911) % 40_000) / 100,
}));

const helper = createDataTableColumnHelper<Trade>();
const columns = helper.columns([
  helper.accessor("id", { header: "#", size: 80, meta: { align: "end" } }),
  helper.accessor("symbol", { header: "Symbol", size: 120 }),
  helper.accessor("side", { header: "Side", size: 100 }),
  helper.accessor("qty", { header: "Qty", size: 100, meta: { align: "end" } }),
  helper.accessor("price", { header: "Price", meta: { align: "end" }, cell: ({ getValue }) => getValue().toFixed(2) }),
]);

const picked = ref<number | null>(null);
const onRowClick = (_event: MouseEvent | KeyboardEvent, row: DataTableRow<Trade>) => {
  picked.value = row.original.id;
};
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-3">
    <DataTable
      :data="trades"
      :columns="columns"
      :get-row-id="(row) => String(row.id)"
      height="400px"
      sticky
      virtualize
      sortable
      size="sm"
      striped
      :on-row-click="onRowClick"
      class="rounded-lg border"
    />
    <p class="text-body-sm text-muted-foreground">{{ picked === null ? "Click a row." : `Trade #${picked}` }}</p>
  </div>
</template>
