<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const products = ["Widgets", "Gadgets", "Gizmos", "Doohickeys", "Thingamajigs", "Whatsits", "Contraptions", "Gubbins"];

const cell = (product: number, month: number) => ((product + 1) * (month + 3) * 17) % 900;
const yearOf = (product: number) => months.reduce((sum, _, month) => sum + cell(product, month), 0);
</script>

<template>
  <ScrollArea orientation="both" class="h-80 w-full max-w-lg rounded-lg border">
    <Table overflow="visible">
      <TableHeader sticky>
        <TableRow>
          <TableHead pinned="start" pinned-edge class="w-36 min-w-36">Product</TableHead>
          <TableHead v-for="month in months" :key="month" align="end" class="min-w-20">{{ month }}</TableHead>
          <TableHead pinned="end" pinned-edge align="end" class="w-24 min-w-24">Year</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(product, index) in products" :key="product">
          <TableCell pinned="start" pinned-edge class="font-medium">{{ product }}</TableCell>
          <TableCell v-for="(month, monthIndex) in months" :key="month" align="end">
            {{ cell(index, monthIndex) }}
          </TableCell>
          <TableCell pinned="end" pinned-edge align="end" class="font-medium">{{ yearOf(index) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </ScrollArea>
</template>
