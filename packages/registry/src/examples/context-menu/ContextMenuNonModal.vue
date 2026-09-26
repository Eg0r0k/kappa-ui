<script setup lang="ts">
import { Copy, Pencil, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/ui/context-menu";

const files = [
  "Quarterly report.pdf", "Roadmap.fig", "Invoices.xlsx", "Brand guide.pdf", "Onboarding.docx", "Budget 2027.xlsx",
  "Release notes.md", "Interview notes.docx", "Pitch deck.key", "Research.pdf", "Contracts.zip", "Wireframes.fig",
];

const open = ref(false);
const selected = ref(files[0]);
</script>

<template>
  <ContextMenu v-model:open="open" :modal="false">
    <ContextMenuTrigger as-child>
      <ul class="flex h-56 w-full max-w-sm flex-col overflow-y-auto rounded-xl border p-1">
        <li
          v-for="file in files"
          :key="file"
          :class="[
            'shrink-0 rounded-lg px-3 py-2 text-body-md transition-colors duration-short-3 ease-standard',
            open && selected === file && 'bg-muted',
          ]"
          @contextmenu="selected = file"
        >
          {{ file }}
        </li>
      </ul>
    </ContextMenuTrigger>
    <ContextMenuContent size="sm" class="w-48">
      <ContextMenuLabel class="truncate">{{ selected }}</ContextMenuLabel>
      <ContextMenuItem>
        <Pencil />
        Rename
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        Duplicate
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">
        <Trash2 />
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
