<script setup lang="ts">
import { ref } from "vue";

import { ScrollArea } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, type TableDensity, TableHead, TableHeader, TableRow } from "@/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const density = ref<TableDensity>("sm");
const striped = ref(true);

const setDensity = (value: unknown) => {
  if (value === "sm" || value === "md" || value === "lg") density.value = value;
};

const firstNames = ["Ada", "Grace", "Linus", "Margaret", "Katherine", "Marie", "Alan", "Barbara", "Dennis", "Radia"];
const lastNames = [
  "Lovelace",
  "Hopper",
  "Torvalds",
  "Hamilton",
  "Johnson",
  "Curie",
  "Turing",
  "Liskov",
  "Ritchie",
  "Perlman",
];
const cities = ["Berlin", "Lisbon", "Oslo", "Tokyo", "Toronto", "Zurich"];

const rows = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  name: `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`,
  city: cities[(index * 3) % cities.length],
  orders: (index * 37) % 90,
  revenue: ((index * 911) % 9000) + 100,
  refunds: (index * 13) % 7,
  margin: `${((index * 17) % 40) + 10}%`,
  status: index % 5 === 0 ? "Churned" : index % 3 === 0 ? "Trial" : "Active",
}));
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <ToggleGroup type="single" variant="outline" size="sm" :model-value="density" @update:model-value="setDensity">
        <ToggleGroupItem value="sm">sm</ToggleGroupItem>
        <ToggleGroupItem value="md">md</ToggleGroupItem>
        <ToggleGroupItem value="lg">lg</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        :model-value="striped ? 'on' : 'off'"
        @update:model-value="(value) => (striped = value === 'on')"
      >
        <ToggleGroupItem value="on">Striped</ToggleGroupItem>
        <ToggleGroupItem value="off">Plain</ToggleGroupItem>
      </ToggleGroup>
    </div>
    <ScrollArea orientation="both" class="h-96 rounded-lg border">
      <Table overflow="visible" :density="density" :striped="striped">
        <TableHeader sticky>
          <TableRow>
            <TableHead pinned="start" align="end" class="w-14 min-w-14">#</TableHead>
            <TableHead pinned="start" pinned-edge class="w-44 min-w-44 [--pin-start:3.5rem]">Customer</TableHead>
            <TableHead class="min-w-28">City</TableHead>
            <TableHead align="end" class="min-w-24">Orders</TableHead>
            <TableHead align="end" class="min-w-28">Revenue</TableHead>
            <TableHead align="end" class="min-w-24">Refunds</TableHead>
            <TableHead align="end" class="min-w-24">Margin</TableHead>
            <TableHead pinned="end" pinned-edge class="w-28 min-w-28">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in rows" :key="row.id">
            <TableCell pinned="start" align="end" class="text-muted-foreground">{{ row.id }}</TableCell>
            <TableCell pinned="start" pinned-edge class="font-medium [--pin-start:3.5rem]">{{ row.name }}</TableCell>
            <TableCell>{{ row.city }}</TableCell>
            <TableCell align="end">{{ row.orders }}</TableCell>
            <TableCell align="end">${{ row.revenue }}</TableCell>
            <TableCell align="end">{{ row.refunds }}</TableCell>
            <TableCell align="end">{{ row.margin }}</TableCell>
            <TableCell pinned="end" pinned-edge>{{ row.status }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollArea>
  </div>
</template>
