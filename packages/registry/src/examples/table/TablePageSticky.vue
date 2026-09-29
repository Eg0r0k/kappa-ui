<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const rows = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  sku: `SKU-${1000 + index * 7}`,
  name: `Item ${index + 1}`,
  stock: (index * 53) % 120,
  price: `$${((index * 19) % 80) + 5}.00`,
}));
</script>

<template>
  <Table overflow="visible" class="w-full max-w-lg">
    <TableHeader sticky>
      <TableRow>
        <TableHead class="w-16">#</TableHead>
        <TableHead>SKU</TableHead>
        <TableHead>Name</TableHead>
        <TableHead align="end">Stock</TableHead>
        <TableHead align="end">Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="row in rows" :key="row.id">
        <TableCell class="text-muted-foreground">{{ row.id }}</TableCell>
        <TableCell class="font-mono text-body-sm">{{ row.sku }}</TableCell>
        <TableCell>{{ row.name }}</TableCell>
        <TableCell align="end">{{ row.stock }}</TableCell>
        <TableCell align="end">{{ row.price }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
