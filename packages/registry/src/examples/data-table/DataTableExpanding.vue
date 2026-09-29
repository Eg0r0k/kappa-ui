<script setup lang="ts">
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";

type Line = { sku: string; qty: number; price: number };
type Order = { id: number; customer: string; placed: string; total: number; lines: Line[] };

const orders: Order[] = [
  {
    id: 1041,
    customer: "Ada Lovelace",
    placed: "2026-09-12",
    total: 184,
    lines: [
      { sku: "KB-75", qty: 1, price: 129 },
      { sku: "CABLE-2M", qty: 2, price: 12 },
      { sku: "KEYCAPS", qty: 1, price: 31 },
    ],
  },
  {
    id: 1042,
    customer: "Grace Hopper",
    placed: "2026-09-13",
    total: 640,
    lines: [{ sku: "MON-27", qty: 2, price: 320 }],
  },
  {
    id: 1043,
    customer: "Linus Torvalds",
    placed: "2026-09-14",
    total: 58,
    lines: [
      { sku: "MOUSE-W", qty: 1, price: 46 },
      { sku: "PAD-L", qty: 1, price: 12 },
    ],
  },
  {
    id: 1044,
    customer: "Margaret Hamilton",
    placed: "2026-09-15",
    total: 1299,
    lines: [{ sku: "LAPTOP-14", qty: 1, price: 1299 }],
  },
];

const helper = createDataTableColumnHelper<Order>();
const columns = helper.columns([
  helper.accessor("id", { header: "Order", size: 100 }),
  helper.accessor("customer", { header: "Customer" }),
  helper.accessor("placed", { header: "Placed", size: 130 }),
  helper.accessor("total", {
    header: "Total",
    size: 110,
    meta: { align: "end" },
    cell: ({ getValue }) => `$${getValue()}`,
  }),
]);
</script>

<template>
  <DataTable :data="orders" :columns="columns" :get-row-id="(row) => String(row.id)" expandable class="w-full max-w-lg">
    <template #expanded="{ row }">
      <ul class="flex flex-col gap-1 py-1 ps-10 text-body-sm">
        <li v-for="line in row.original.lines" :key="line.sku" class="flex justify-between gap-4">
          <span>{{ line.qty }} × {{ line.sku }}</span>
          <span class="text-muted-foreground">${{ line.qty * line.price }}</span>
        </li>
      </ul>
    </template>
  </DataTable>
</template>
