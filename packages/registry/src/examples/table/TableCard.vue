<script setup lang="ts">
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const deployments = [
  {
    id: "dpl_8f21",
    env: "Production",
    commit: "feat(table): add the table primitives",
    when: "2 min ago",
    status: "Ready",
  },
  { id: "dpl_8f1c", env: "Preview", commit: "docs(table): add the Table page", when: "18 min ago", status: "Ready" },
  {
    id: "dpl_8f0a",
    env: "Preview",
    commit: "feat(scroll-area): add InfiniteScroll",
    when: "1 h ago",
    status: "Building",
  },
  {
    id: "dpl_8ef3",
    env: "Production",
    commit: "fix(core): keep a following tooltip in place",
    when: "3 h ago",
    status: "Error",
  },
];

const color = (status: string) => (status === "Ready" ? "success" : status === "Error" ? "destructive" : "warning");
</script>

<template>
  <Card class="w-full max-w-2xl">
    <CardHeader>
      <CardTitle>Deployments</CardTitle>
      <CardDescription>The last four builds of this project.</CardDescription>
    </CardHeader>
    <CardContent class="px-0">
      <Table>
        <TableCaption>Recent deployments with their environment and status.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead class="ps-6">Deployment</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Commit</TableHead>
            <TableHead>When</TableHead>
            <TableHead align="end" class="pe-6">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="deployment in deployments" :key="deployment.id">
            <TableCell class="ps-6 font-mono text-body-sm">{{ deployment.id }}</TableCell>
            <TableCell>{{ deployment.env }}</TableCell>
            <TableCell class="max-w-64 truncate">{{ deployment.commit }}</TableCell>
            <TableCell class="text-muted-foreground">{{ deployment.when }}</TableCell>
            <TableCell align="end" class="pe-6">
              <Badge :color="color(deployment.status)" variant="soft">{{ deployment.status }}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
