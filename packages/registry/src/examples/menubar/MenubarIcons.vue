<script setup lang="ts">
import { ClipboardPaste, Copy, Scissors, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/ui/menubar";

const spellcheck = ref(true);
</script>

<template>
  <Menubar aria-label="Editor">
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent class="w-56">
        <MenubarGroup>
          <MenubarLabel>Clipboard</MenubarLabel>
          <MenubarItem>
            <Scissors />
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Copy />
            Copy
            <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <ClipboardPaste />
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarItem variant="destructive">
          <Trash2 />
          Delete
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Tools</MenubarTrigger>
      <MenubarContent class="w-56">
        <MenubarLabel inset>Proofing</MenubarLabel>
        <MenubarCheckboxItem v-model="spellcheck">Check spelling</MenubarCheckboxItem>
        <MenubarItem inset>Word count</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger disabled>Extensions</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Manage…</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>
