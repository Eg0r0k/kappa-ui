<script setup lang="ts">
import { Copy, Scissors, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/ui/context-menu";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const view = ref("list");
</script>

<template>
  <div class="grid w-full max-w-lg grid-cols-3 gap-2 sm:grid-cols-5">
    <ContextMenu v-for="size in sizes" :key="size">
      <ContextMenuTrigger
        class="flex h-20 items-center justify-center rounded-xl border border-dashed text-body-md text-muted-foreground"
      >
        {{ size }}
      </ContextMenuTrigger>
      <ContextMenuContent :size="size">
        <ContextMenuItem>
          <Scissors />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>View</ContextMenuLabel>
        <ContextMenuRadioGroup v-model="view">
          <ContextMenuRadioItem value="list">List</ContextMenuRadioItem>
          <ContextMenuRadioItem value="grid">Grid</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>
