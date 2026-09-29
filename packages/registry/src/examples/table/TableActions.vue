<script setup lang="ts">
import { Ellipsis } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/ui/menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

type Invoice = { id: string; customer: string; amount: string; status: "paid" | "open" | "overdue" };

const invoices: Invoice[] = [
  { id: "INV-1041", customer: "Ada Lovelace", amount: "$184.00", status: "paid" },
  { id: "INV-1042", customer: "Grace Hopper", amount: "$640.00", status: "open" },
  { id: "INV-1043", customer: "Linus Torvalds", amount: "$58.00", status: "overdue" },
  { id: "INV-1044", customer: "Margaret Hamilton", amount: "$1,299.00", status: "paid" },
  { id: "INV-1045", customer: "Katherine Johnson", amount: "$320.00", status: "open" },
];

const last = ref("");
const act = (action: string, invoice: Invoice) => {
  last.value = `${action} ${invoice.id}`;
};
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-3">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
          <TableHead class="w-12"><span class="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="invoice in invoices" :key="invoice.id">
          <TableCell class="font-medium">{{ invoice.id }}</TableCell>
          <TableCell>{{ invoice.customer }}</TableCell>
          <TableCell class="capitalize">{{ invoice.status }}</TableCell>
          <TableCell align="end">{{ invoice.amount }}</TableCell>
          <TableCell align="end">
            <MenuTrigger as-child>
              <Button variant="ghost" color="neutral" size="icon-xs" :aria-label="`Actions for ${invoice.id}`">
                <Ellipsis />
              </Button>
            </MenuTrigger>
            <Menu>
              <MenuItem @select="act('Open', invoice)">Open</MenuItem>
              <MenuItem @select="act('Download', invoice)">Download PDF</MenuItem>
              <MenuItem @select="act('Remind', invoice)">Send reminder</MenuItem>
              <MenuSeparator />
              <MenuItem variant="destructive" @select="act('Void', invoice)">Void</MenuItem>
            </Menu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <p class="text-body-sm text-muted-foreground">{{ last || "Open a row's menu." }}</p>
  </div>
</template>
