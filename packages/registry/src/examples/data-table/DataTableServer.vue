<script setup lang="ts">
import { ref, watch } from "vue";

import { createDataTableColumnHelper, DataTable, type PaginationState, type SortingState } from "@/ui/data-table";

type Order = { id: number; customer: string; total: number; status: "paid" | "pending" | "refunded" };

const names = ["Ada", "Grace", "Linus", "Margaret", "Katherine", "Marie", "Alan", "Barbara", "Dennis", "Radia"];
const all: Order[] = Array.from({ length: 500 }, (_, index) => ({
  id: 1000 + index,
  customer: names[(index * 7) % names.length]!,
  total: ((index * 911) % 9000) + 50,
  status: index % 7 === 0 ? "refunded" : index % 3 === 0 ? "pending" : "paid",
}));

const fetchPage = (pagination: PaginationState, sorting: SortingState) =>
  new Promise<Order[]>((resolve) => {
    setTimeout(() => {
      const sorted = [...all];
      const [sort] = sorting;
      if (sort) {
        const key = sort.id as keyof Order;
        sorted.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (sort.desc ? -1 : 1));
      }
      const from = pagination.pageIndex * pagination.pageSize;
      resolve(sorted.slice(from, from + pagination.pageSize));
    }, 300);
  });

const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 });
const sorting = ref<SortingState>([]);
const rows = ref<Order[]>(all.slice(0, 10));
const loading = ref(false);

watch([pagination, sorting], async ([page, sort]) => {
  loading.value = true;
  rows.value = await fetchPage(page, sort);
  loading.value = false;
});

const helper = createDataTableColumnHelper<Order>();
const columns = helper.columns([
  helper.accessor("id", { header: "Order", size: 100 }),
  helper.accessor("customer", { header: "Customer" }),
  helper.accessor("status", { header: "Status", size: 120 }),
  helper.accessor("total", {
    header: "Total",
    size: 120,
    meta: { align: "end" },
    cell: ({ getValue }) => `$${getValue()}`,
  }),
]);
</script>

<template>
  <DataTable
    v-model:pagination="pagination"
    v-model:sorting="sorting"
    :data="rows"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    :loading="loading"
    manual
    :row-count="all.length"
    sortable
    :paginate="{ pageSize: 10 }"
    height="360px"
    sticky
    class="w-full max-w-lg"
  />
</template>
