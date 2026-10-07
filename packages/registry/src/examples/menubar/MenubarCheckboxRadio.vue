<script setup lang="ts">
import { reactive } from "vue";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/ui/menubar";

const settings = reactive({
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  theme: "system",
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <Menubar aria-label="Code editor">
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent class="w-56">
          <MenubarLabel inset>Editor</MenubarLabel>
          <MenubarCheckboxItem v-model="settings.wordWrap">Word wrap</MenubarCheckboxItem>
          <MenubarCheckboxItem v-model="settings.minimap">Minimap</MenubarCheckboxItem>
          <MenubarCheckboxItem v-model="settings.lineNumbers">Line numbers</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel inset>Theme</MenubarLabel>
          <MenubarRadioGroup v-model="settings.theme">
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            <MenubarRadioItem value="system">Match system</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
    <pre class="rounded-lg bg-muted px-3 py-2 text-body-sm">{{ settings }}</pre>
  </div>
</template>
