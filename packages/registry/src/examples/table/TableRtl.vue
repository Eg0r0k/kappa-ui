<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس"];
const products = ["أجهزة", "برمجيات", "خدمات", "تدريب", "دعم"];

const cell = (product: number, month: number) => ((product + 2) * (month + 5) * 13) % 700;
</script>

<template>
  <ScrollArea orientation="both" dir="rtl" class="h-64 w-full max-w-md rounded-lg border">
    <Table overflow="visible">
      <TableHeader sticky>
        <TableRow>
          <TableHead pinned="start" pinned-edge class="w-28 min-w-28">المنتج</TableHead>
          <TableHead v-for="month in months" :key="month" align="end" class="min-w-24">{{ month }}</TableHead>
          <TableHead pinned="end" pinned-edge align="end" class="w-24 min-w-24">المجموع</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(product, index) in products" :key="product">
          <TableCell pinned="start" pinned-edge class="font-medium">{{ product }}</TableCell>
          <TableCell v-for="(month, monthIndex) in months" :key="month" align="end">
            {{ cell(index, monthIndex) }}
          </TableCell>
          <TableCell pinned="end" pinned-edge align="end" class="font-medium">
            {{ months.reduce((sum, _, monthIndex) => sum + cell(index, monthIndex), 0) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </ScrollArea>
</template>
