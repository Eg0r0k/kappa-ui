<script setup lang="ts">
import { ref } from "vue";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableSize } from "@/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const sizes: TableSize[] = ["xs", "sm", "md", "lg", "xl"];
const size = ref<TableSize>("md");

const setSize = (value: unknown) => {
  const next = sizes.find((candidate) => candidate === value);
  if (next) size.value = next;
};

const people = [
  { name: "Ada Lovelace", role: "Engineer", email: "ada@example.com" },
  { name: "Grace Hopper", role: "Admiral", email: "grace@example.com" },
  { name: "Katherine Johnson", role: "Mathematician", email: "katherine@example.com" },
];
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <ToggleGroup type="single" variant="outline" size="sm" :model-value="size" @update:model-value="setSize">
      <ToggleGroupItem v-for="option in sizes" :key="option" :value="option">{{ option }}</ToggleGroupItem>
    </ToggleGroup>
    <Table :size="size" striped class="rounded-lg border">
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
