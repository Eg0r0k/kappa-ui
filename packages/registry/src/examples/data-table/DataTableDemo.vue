<script setup lang="ts">
import { Badge } from "@/ui/badge";
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";

type Payment = { id: string; status: "success" | "processing" | "failed"; email: string; amount: number };

const payments: Payment[] = [
  { id: "m5gr84i9", status: "success", email: "ken99@example.com", amount: 316 },
  { id: "3u1reuv4", status: "success", email: "abe45@example.com", amount: 242 },
  { id: "derv1ws0", status: "processing", email: "monserrat44@example.com", amount: 837 },
  { id: "5kma53ae", status: "success", email: "silas22@example.com", amount: 874 },
  { id: "bhqecj4p", status: "failed", email: "carmella@example.com", amount: 721 },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const helper = createDataTableColumnHelper<Payment>();
const columns = helper.columns([
  helper.accessor("status", { header: "Status", size: 130 }),
  helper.accessor("email", { header: "Email" }),
  helper.accessor("amount", {
    header: "Amount",
    size: 120,
    meta: { align: "end" },
    cell: ({ getValue }) => currency.format(getValue()),
  }),
]);

const color = (status: Payment["status"]) =>
  status === "success" ? "success" : status === "failed" ? "destructive" : "warning";
</script>

<template>
  <DataTable :data="payments" :columns="columns" :get-row-id="(row) => row.id" sortable class="w-full max-w-lg">
    <template #cell-status="{ getValue }">
      <Badge variant="soft" :color="color(getValue() as Payment['status'])">{{ getValue() }}</Badge>
    </template>
  </DataTable>
</template>
