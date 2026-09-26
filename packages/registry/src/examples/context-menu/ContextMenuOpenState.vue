<script setup lang="ts">
import { FileText, Pencil, Share2, Trash2 } from "@lucide/vue";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/ui/context-menu";

const files = ["Brief.docx", "Budget.xlsx", "Notes.md"];
</script>

<template>
  <div class="grid w-full max-w-md grid-cols-3 gap-3">
    <ContextMenu v-for="file in files" :key="file">
      <ContextMenuTrigger
        class="flex flex-col items-center gap-2 rounded-xl border p-4 text-body-sm transition-colors duration-short-3 ease-standard data-[state=open]:border-primary data-[state=open]:bg-primary/(--state-selected)"
      >
        <FileText class="size-8 text-muted-foreground" />
        {{ file }}
      </ContextMenuTrigger>
      <ContextMenuContent size="sm">
        <ContextMenuItem>
          <Pencil />
          Rename
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 />
          Share
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>
