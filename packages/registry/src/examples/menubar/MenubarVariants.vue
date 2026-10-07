<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/ui/menubar";

const variants = ["outline", "soft", "ghost"] as const;
const menus = {
  File: ["New", "Open…", "Save"],
  Edit: ["Undo", "Redo"],
  View: ["Zoom in", "Zoom out"],
};
</script>

<template>
  <div class="flex w-full max-w-xl flex-col gap-6">
    <div class="flex flex-wrap items-center gap-3">
      <Menubar
        v-for="variant in variants"
        :key="variant"
        :variant="variant"
        size="sm"
        :aria-label="`Application, ${variant}`"
      >
        <MenubarMenu v-for="(items, name) in menus" :key="name">
          <MenubarTrigger>{{ name }}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem v-for="label in items" :key="label">{{ label }}</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <header class="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
      <span class="text-title-sm">Quarterly report</span>
      <Menubar variant="ghost" size="sm" aria-label="Document">
        <MenubarMenu v-for="(items, name) in menus" :key="name">
          <MenubarTrigger>{{ name }}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem v-for="label in items" :key="label">{{ label }}</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Preferences…</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Avatar size="sm" class="ms-auto">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </header>
  </div>
</template>
