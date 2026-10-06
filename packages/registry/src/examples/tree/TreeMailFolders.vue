<script setup lang="ts">
import { Archive, Folder, Inbox, Send } from "@lucide/vue";
import { shallowRef } from "vue";

import { Badge } from "@/ui/badge";
import { Tree } from "@/ui/tree";

type Mailbox = { id: string; label: string; icon: typeof Inbox; unread?: number; children?: Mailbox[] };

const mailboxes: Mailbox[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    unread: 12,
    children: [
      { id: "inbox/receipts", label: "Receipts", icon: Folder, unread: 2 },
      { id: "inbox/travel", label: "Travel", icon: Folder },
    ],
  },
  { id: "sent", label: "Sent", icon: Send },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    children: [
      { id: "archive/2025", label: "2025", icon: Folder },
      { id: "archive/2024", label: "2024", icon: Folder },
    ],
  },
];

const open = shallowRef<Mailbox>(mailboxes[0]!);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <Tree
      v-model="open"
      :items="mailboxes"
      :toggle-on-click="false"
      selection-behavior="replace"
      aria-label="Mailboxes"
    >
      <template #item-trailing="{ item }">
        <Badge v-if="item.unread" variant="soft" size="sm">{{ item.unread }}</Badge>
      </template>
    </Tree>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      Showing {{ open.label }}. Click the chevron or double-click a folder to open it.
    </p>
  </div>
</template>
