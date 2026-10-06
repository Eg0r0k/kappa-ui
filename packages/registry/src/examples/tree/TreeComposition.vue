<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Tree, TreeItem, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

type Person = { id: string; label: string; role: string; children?: Person[] };

const team: Person[] = [
  {
    id: "maya",
    label: "Maya Chen",
    role: "VP Engineering",
    children: [
      {
        id: "omar",
        label: "Omar Haddad",
        role: "Platform lead",
        children: [
          { id: "lena", label: "Lena Fischer", role: "SRE" },
          { id: "tom", label: "Tom Okafor", role: "Backend" },
        ],
      },
      { id: "ines", label: "Inês Duarte", role: "Design lead" },
    ],
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");
</script>

<template>
  <Tree
    v-slot="{ items }"
    :items="team"
    :default-expanded="['maya', 'omar']"
    size="lg"
    variant="outline"
    aria-label="Team"
    class="w-full max-w-xs"
  >
    <TreeItem v-for="row in items" :key="row._id" :item="row">
      <TreeItemToggle />
      <Avatar size="xs" aria-hidden="true">
        <AvatarFallback>{{ initials(row.value.label) }}</AvatarFallback>
      </Avatar>
      <TreeItemLabel class="flex flex-col">
        <span class="truncate">{{ row.value.label }}</span>
        <span class="truncate text-body-sm text-muted-foreground">{{ row.value.role }}</span>
      </TreeItemLabel>
    </TreeItem>
  </Tree>
</template>
