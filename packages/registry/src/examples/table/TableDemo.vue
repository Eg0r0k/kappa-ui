<script setup lang="ts">
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/ui/table";

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit card", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV003", status: "Unpaid", method: "Bank transfer", amount: "$350.00" },
  { id: "INV004", status: "Paid", method: "Credit card", amount: "$450.00" },
  { id: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
];
</script>

<template>
  <Table>
    <TableCaption visible>A list of your recent invoices.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead class="w-24">Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Method</TableHead>
        <TableHead align="end">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="invoice in invoices" :key="invoice.id">
        <TableCell class="font-medium">{{ invoice.id }}</TableCell>
        <TableCell>{{ invoice.status }}</TableCell>
        <TableCell>{{ invoice.method }}</TableCell>
        <TableCell align="end">{{ invoice.amount }}</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell :colspan="3">Total</TableCell>
        <TableCell align="end">$1,750.00</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</template>
