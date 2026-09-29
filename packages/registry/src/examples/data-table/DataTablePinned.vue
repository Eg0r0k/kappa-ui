<script setup lang="ts">
import { createDataTableColumnHelper, DataTable, type DataTableColumn } from "@/ui/data-table";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type Month = (typeof months)[number];
type Row = { product: string; total: number } & Record<Month, number>;

const products = ["Widgets", "Gadgets", "Gizmos", "Doohickeys", "Thingamajigs", "Whatsits", "Contraptions", "Gubbins"];

const rows: Row[] = products.map((product, index) => {
  const values = Object.fromEntries(months.map((month, m) => [month, ((index + 1) * (m + 3) * 17) % 900])) as Record<
    Month,
    number
  >;
  const total = months.reduce((sum, month) => sum + values[month], 0);
  return { product, ...values, total };
});

const helper = createDataTableColumnHelper<Row>();
const columns: DataTableColumn<Row>[] = [
  helper.accessor("product", { header: "Product", size: 150 }),
  ...months.map((month) => helper.accessor(month, { header: month, size: 90, meta: { align: "end" } })),
  helper.accessor("total", { header: "Year", size: 100, meta: { align: "end" } }),
];
</script>

<template>
  <DataTable
    :data="rows"
    :columns="columns"
    :get-row-id="(row) => row.product"
    :column-pinning="{ start: ['product'], end: ['total'] }"
    height="320px"
    sticky
    class="w-full max-w-lg rounded-lg border"
  />
</template>
