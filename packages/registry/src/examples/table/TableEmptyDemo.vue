<script setup lang="ts">
import { Table, TableBody, TableEmpty, TableHead, TableHeader, TableRow } from "@/ui/table";
</script>

<template>
  <Table class="w-full max-w-md rounded-lg border">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead align="end">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableEmpty :colspan="3">No invoices yet.</TableEmpty>
    </TableBody>
  </Table>
</template>
