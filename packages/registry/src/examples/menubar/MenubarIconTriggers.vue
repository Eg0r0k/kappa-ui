<script setup lang="ts">
import { CircleHelp, LayoutGrid, Settings } from "@lucide/vue";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/ui/menubar";
import { vTooltip } from "@/ui/tooltip";
</script>

<template>
  <!-- v-tooltip, never <Tooltip> around a trigger: the component takes over the menu's anchor -->
  <Menubar aria-label="Workspace" variant="soft">
    <MenubarMenu>
      <MenubarTrigger v-tooltip.label="'Apps'" class="w-(--menubar-h) justify-center px-0">
        <LayoutGrid />
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Mail</MenubarItem>
        <MenubarItem>Calendar</MenubarItem>
        <MenubarItem>Drive</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger v-tooltip.label="'Settings'" class="w-(--menubar-h) justify-center px-0">
        <Settings />
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Account</MenubarItem>
        <MenubarItem>Notifications</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Keyboard shortcuts</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger v-tooltip.label="'Help'" class="w-(--menubar-h) justify-center px-0">
        <CircleHelp />
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Documentation</MenubarItem>
        <MenubarItem>Contact support</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>
