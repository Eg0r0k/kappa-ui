<script setup lang="ts">
import { Bold, ChevronDown, Italic, Underline } from "@lucide/vue";
import { ref } from "vue";

import { Menu, MenuRadioGroup, MenuRadioItem } from "@/ui/menu";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/ui/menubar";
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem } from "@/ui/toolbar";

const ruler = ref(true);
const marks = ref<string[]>(["bold"]);
const textSize = ref("body");
const textSizes = { title: "Title", heading: "Heading", body: "Body", caption: "Caption" } as const;
</script>

<template>
  <div class="w-full max-w-xl overflow-hidden rounded-xl border border-border">
    <div class="flex items-center gap-2 border-b border-border px-2 py-1">
      <Menubar variant="ghost" size="sm" aria-label="Document">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New document
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Make a copy</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Download as PDF</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem v-model="ruler">Show ruler</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <!-- toggles and actions at bar level belong in a Toolbar; a menubar holds only menus -->
    <Toolbar variant="ghost" aria-label="Formatting" class="px-2 py-1">
      <ToolbarButton variant="ghost" class="min-w-28 justify-between">
        {{ textSizes[textSize as keyof typeof textSizes] }}
        <ChevronDown data-icon="inline-end" />
        <Menu size="sm" auto-close>
          <MenuRadioGroup v-model="textSize">
            <MenuRadioItem v-for="(label, value) in textSizes" :key="value" :value="value">{{ label }}</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup v-model="marks" type="multiple" aria-label="Text style" size="icon-sm">
        <ToolbarToggleItem value="bold" aria-label="Bold"><Bold /></ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic"><Italic /></ToolbarToggleItem>
        <ToolbarToggleItem value="underline" aria-label="Underline"><Underline /></ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>

    <p class="border-t border-border px-4 py-6 text-body-md text-muted-foreground">
      The quick brown fox jumps over the lazy dog.
    </p>
  </div>
</template>
