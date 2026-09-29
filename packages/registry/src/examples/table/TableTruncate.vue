<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const issues = [
  {
    id: "KUI-101",
    title: "Sticky header loses its bottom border once the first row scrolls under it",
    reporter: "ada@example.com",
    labels: "bug, table, sticky",
  },
  {
    id: "KUI-102",
    title: "Pinned column shadow shows while nothing is scrolled under it",
    reporter: "grace@example.com",
    labels: "bug, pinned",
  },
  {
    id: "KUI-103",
    title: "Add a density prop so dashboards can pack more rows into the same height",
    reporter: "katherine@example.com",
    labels: "enhancement",
  },
];
</script>

<template>
  <Table layout="fixed" class="w-full max-w-lg rounded-lg border">
    <TableHeader>
      <TableRow>
        <TableHead class="w-24">Key</TableHead>
        <TableHead>Title</TableHead>
        <TableHead class="w-40">Reporter</TableHead>
        <TableHead class="w-28">Labels</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="issue in issues" :key="issue.id">
        <TableCell class="font-medium">{{ issue.id }}</TableCell>
        <TableCell truncate :title="issue.title">{{ issue.title }}</TableCell>
        <TableCell truncate :title="issue.reporter">{{ issue.reporter }}</TableCell>
        <TableCell truncate>{{ issue.labels }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
