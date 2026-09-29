<script setup lang="ts">
import { ref } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const files = [
  { id: 1, name: "Quarterly report.pdf", size: "1.2 MB" },
  { id: 2, name: "Board deck.key", size: "48 MB" },
  { id: 3, name: "Budget.xlsx", size: "310 KB" },
  { id: 4, name: "Notes.md", size: "4 KB" },
];

const selected = ref(new Set<number>([2]));

const toggle = (id: number) => {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
};

const onKeydown = (event: KeyboardEvent, id: number) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggle(id);
};
</script>

<template>
  <Table class="w-full max-w-md rounded-lg border">
    <TableHeader>
      <TableRow>
        <TableHead class="w-10" />
        <TableHead>Name</TableHead>
        <TableHead align="end">Size</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="file in files"
        :key="file.id"
        clickable
        :selected="selected.has(file.id)"
        @click="toggle(file.id)"
        @keydown="onKeydown($event, file.id)"
      >
        <TableCell>
          <Checkbox
            :model-value="selected.has(file.id)"
            :aria-label="`Select ${file.name}`"
            tabindex="-1"
            @click.stop="toggle(file.id)"
          />
        </TableCell>
        <TableCell>{{ file.name }}</TableCell>
        <TableCell align="end">{{ file.size }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
