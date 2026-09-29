<script setup lang="ts">
import { ref } from "vue";

import { Table, TableBody, TableCell, type TableDensity, TableHead, TableHeader, TableRow } from "@/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const density = ref<TableDensity>("md");

const setDensity = (value: unknown) => {
  if (value === "sm" || value === "md" || value === "lg") density.value = value;
};

const people = [
  { name: "Ada Lovelace", role: "Engineer", email: "ada@example.com" },
  { name: "Grace Hopper", role: "Admiral", email: "grace@example.com" },
  { name: "Katherine Johnson", role: "Mathematician", email: "katherine@example.com" },
];
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <ToggleGroup type="single" variant="outline" size="sm" :model-value="density" @update:model-value="setDensity">
      <ToggleGroupItem value="sm">Compact</ToggleGroupItem>
      <ToggleGroupItem value="md">Default</ToggleGroupItem>
      <ToggleGroupItem value="lg">Comfortable</ToggleGroupItem>
    </ToggleGroup>
    <Table :density="density" striped class="rounded-lg border">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="person in people" :key="person.email">
          <TableCell class="font-medium">{{ person.name }}</TableCell>
          <TableCell>{{ person.role }}</TableCell>
          <TableCell>{{ person.email }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
