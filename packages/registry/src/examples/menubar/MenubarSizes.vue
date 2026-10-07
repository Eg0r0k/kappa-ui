<script setup lang="ts">
import { FilePlus, FolderOpen, Redo2, Save, Undo2 } from "@lucide/vue";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/ui/menubar";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Menubar v-for="size in sizes" :key="size" :size="size" :aria-label="`Editor, ${size}`">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <FilePlus />
            New
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <FolderOpen />
            Open…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Save />
            Save
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <!-- one menu can opt out of the bar's size -->
        <MenubarContent size="md">
          <MenubarItem>
            <Undo2 />
            Undo
          </MenubarItem>
          <MenubarItem>
            <Redo2 />
            Redo
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>{{ size }}</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Triggers, items and icons all follow the bar's size.</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
</template>
