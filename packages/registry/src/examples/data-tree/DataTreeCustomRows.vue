<script setup lang="ts">
import { Archive, Folder, Inbox, Send } from "@lucide/vue";
import type { Component } from "vue";

import { DataTree } from "@/ui/data-tree";
import { TreeItemIcon, TreeItemLabel, TreeItemToggle } from "@/ui/tree";

type Mailbox = {
  id: string;
  label: string;
  icon: Component;
  unread?: number;
  defaultExpanded?: boolean;
  children?: Mailbox[];
};

const mailboxes: Mailbox[] = [
  { id: "inbox", label: "Inbox", icon: Inbox, unread: 12 },
  { id: "sent", label: "Sent", icon: Send },
  {
    id: "projects",
    label: "Projects",
    icon: Folder,
    unread: 3,
    defaultExpanded: true,
    children: [
      { id: "projects/kappa", label: "kappa-ui", icon: Folder, unread: 3 },
      { id: "projects/site", label: "Website", icon: Folder },
    ],
  },
  { id: "archive", label: "Archive", icon: Archive },
];
</script>

<template>
  <DataTree :items="mailboxes" aria-label="Mailboxes" class="w-full max-w-xs">
    <template #item="{ item }">
      <TreeItemToggle />
      <TreeItemIcon><component :is="item.icon" /></TreeItemIcon>
      <TreeItemLabel>{{ item.label }}</TreeItemLabel>
      <span v-if="item.unread" class="text-body-sm text-muted-foreground tabular-nums">{{ item.unread }}</span>
    </template>
  </DataTree>
</template>
