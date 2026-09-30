<script setup lang="ts">
import { Plus } from "@lucide/vue";

import { Button } from "@/ui/button";
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/ui/empty";

type Invoice = { id: string; customer: string; amount: number };

const invoices: Invoice[] = [];

const helper = createDataTableColumnHelper<Invoice>();
const columns = helper.columns([
  helper.accessor("id", { header: "Invoice", size: 110 }),
  helper.accessor("customer", { header: "Customer" }),
  helper.accessor("amount", { header: "Amount", size: 110, meta: { align: "end" } }),
]);
</script>

<template>
  <DataTable
    :data="invoices"
    :columns="columns"
    :get-row-id="(row) => row.id"
    class="w-full max-w-xl rounded-lg border"
  >
    <template #empty>
      <Empty size="sm" class="p-0 text-foreground">
        <EmptyHeader>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>The first invoice you send will appear here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            New invoice
          </Button>
        </EmptyContent>
      </Empty>
    </template>
  </DataTable>
</template>
