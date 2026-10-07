<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/ui/menubar";

// "" means every menu is closed
const open = ref("");
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <Menubar v-model="open" aria-label="Application">
      <MenubarMenu value="menubar-file">
        <MenubarTrigger class="data-[state=open]:text-primary">File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New</MenubarItem>
          <MenubarItem>Open…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="menubar-edit">
        <MenubarTrigger class="data-[state=open]:text-primary">Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="outline" color="neutral" @click="open = 'menubar-file'">Open File</Button>
      <Button size="sm" variant="outline" color="neutral" @click="open = 'menubar-edit'">Open Edit</Button>
      <span class="text-body-sm text-muted-foreground">Open: {{ open || "none" }}</span>
    </div>
  </div>
</template>
