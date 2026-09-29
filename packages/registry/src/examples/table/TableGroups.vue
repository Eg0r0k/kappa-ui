<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const groups = [
  {
    name: "Design",
    people: [
      { name: "Ada Lovelace", role: "Lead", email: "ada@example.com" },
      { name: "Mary Blair", role: "Illustrator", email: "mary@example.com" },
    ],
  },
  {
    name: "Engineering",
    people: [
      { name: "Grace Hopper", role: "Compiler", email: "grace@example.com" },
      { name: "Margaret Hamilton", role: "Flight software", email: "margaret@example.com" },
      { name: "Katherine Johnson", role: "Trajectories", email: "katherine@example.com" },
    ],
  },
  {
    name: "Research",
    people: [{ name: "Marie Curie", role: "Radioactivity", email: "marie@example.com" }],
  },
];
</script>

<template>
  <Table class="w-full max-w-lg rounded-lg border">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Email</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody v-for="group in groups" :key="group.name">
      <TableRow>
        <TableCell :colspan="3" class="bg-muted/50 font-medium text-muted-foreground">
          {{ group.name }} · {{ group.people.length }}
        </TableCell>
      </TableRow>
      <TableRow v-for="person in group.people" :key="person.email">
        <TableCell class="font-medium">{{ person.name }}</TableCell>
        <TableCell>{{ person.role }}</TableCell>
        <TableCell>{{ person.email }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
