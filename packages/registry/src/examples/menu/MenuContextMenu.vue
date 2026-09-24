<script setup lang="ts">
import { Menu, MenuItem, MenuSeparator, MenuShortcut } from "@/ui/menu";
</script>

<template>
  <div
    class="flex h-36 w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-body-md text-muted-foreground select-none"
  >
    Right-click or long-press here
    <Menu context-menu class="w-52">
      <MenuItem>
        Back
        <MenuShortcut>⌘[</MenuShortcut>
      </MenuItem>
      <MenuItem>
        Reload
        <MenuShortcut>⌘R</MenuShortcut>
      </MenuItem>
      <MenuSeparator />
      <MenuItem>Save page as…</MenuItem>
      <MenuItem>Print…</MenuItem>
    </Menu>
  </div>
</template>
