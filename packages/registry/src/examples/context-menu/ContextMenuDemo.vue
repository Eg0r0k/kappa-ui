<script setup lang="ts">
import { ref } from "vue";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/ui/context-menu";

const bookmarks = ref(true);
const fullUrls = ref(false);
const person = ref("pedro");
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger
      class="flex h-36 w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-body-md text-muted-foreground"
    >
      Right-click here
    </ContextMenuTrigger>
    <ContextMenuContent class="w-60">
      <ContextMenuItem inset>
        Back
        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset disabled>
        Forward
        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset>
        Reload
        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>More tools</ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-48">
          <ContextMenuItem>Save page…</ContextMenuItem>
          <ContextMenuItem>Create shortcut…</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Developer tools</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem v-model="bookmarks">Show bookmarks</ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="fullUrls">Show full URLs</ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuLabel inset>People</ContextMenuLabel>
      <ContextMenuRadioGroup v-model="person">
        <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
        <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </ContextMenuContent>
  </ContextMenu>
</template>
