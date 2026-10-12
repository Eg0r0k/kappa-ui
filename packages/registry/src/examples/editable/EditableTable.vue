<script setup lang="ts">
import { ref } from "vue";

import { Editable, EditableArea, EditableInput, EditablePreview } from "@/ui/editable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const people = ref([
  { id: 1, name: "Ada Lovelace", role: "Analyst" },
  { id: 2, name: "Grace Hopper", role: "Admiral" },
  { id: 3, name: "Alan Turing", role: "Codebreaker" },
]);
</script>

<template>
  <Table class="max-w-md">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="person in people" :key="person.id">
        <TableCell>
          <Editable v-model="person.name" submit-mode="both">
            <EditableArea>
              <EditablePreview />
              <EditableInput :aria-label="`Name of ${person.name}`" />
            </EditableArea>
          </Editable>
        </TableCell>
        <TableCell>
          <Editable v-model="person.role" submit-mode="both" placeholder="No role">
            <EditableArea>
              <EditablePreview />
              <EditableInput :aria-label="`Role of ${person.name}`" />
            </EditableArea>
          </Editable>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
