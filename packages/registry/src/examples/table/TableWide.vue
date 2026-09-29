<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const columns = ["Region", "Country", "City", "Q1", "Q2", "Q3", "Q4", "Total", "Growth", "Margin", "Owner", "Status"];

const rows = Array.from({ length: 6 }, (_, row) => ({
  id: row,
  cells: columns.map((column, index) => (index < 3 ? `${column} ${row + 1}` : `${(row + 1) * (index + 7)}`)),
}));
</script>

<template>
  <Table class="w-full max-w-md rounded-lg border">
    <TableHeader>
      <TableRow>
        <TableHead v-for="column in columns" :key="column" class="min-w-24">{{ column }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="row in rows" :key="row.id">
        <TableCell v-for="(cell, index) in row.cells" :key="index">{{ cell }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
