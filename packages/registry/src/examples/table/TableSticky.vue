<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/ui/table";

const rows = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  name: `Order ${1000 + index}`,
  total: ((index * 37) % 500) + 20,
}));
const total = rows.reduce((sum, row) => sum + row.total, 0);
</script>

<template>
  <ScrollArea class="h-72 w-full max-w-md rounded-lg border">
    <Table overflow="visible">
      <TableHeader sticky>
        <TableRow>
          <TableHead class="w-16">#</TableHead>
          <TableHead>Order</TableHead>
          <TableHead align="end">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.id">
          <TableCell>{{ row.id }}</TableCell>
          <TableCell>{{ row.name }}</TableCell>
          <TableCell align="end">${{ row.total }}</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter sticky>
        <TableRow>
          <TableCell :colspan="2">Sum</TableCell>
          <TableCell align="end">${{ total }}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </ScrollArea>
</template>
