<script setup lang="ts">
import { Archive, Reply, Trash2 } from "@lucide/vue";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu";

const messages = [
  { from: "Ada Lovelace", subject: "Notes on the engine" },
  { from: "Alan Turing", subject: "A question about machines" },
  { from: "Grace Hopper", subject: "Found a bug" },
];
</script>

<template>
  <ul class="flex w-full max-w-sm flex-col rounded-xl border p-1">
    <li
      v-for="message in messages"
      :key="message.from"
      class="flex flex-col rounded-lg px-3 py-2 transition-colors data-[state=open]:bg-muted"
    >
      <span class="text-body-md">{{ message.from }}</span>
      <span class="text-body-sm text-muted-foreground">{{ message.subject }}</span>
      <Menu context-menu size="sm" auto-close>
        <MenuItem>
          <Reply />
          Reply
        </MenuItem>
        <MenuItem>
          <Archive />
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <Trash2 />
          Delete
        </MenuItem>
      </Menu>
    </li>
  </ul>
</template>
