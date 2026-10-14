<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@/ui/menu";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Button variant="outline" color="neutral">
    Edit
    <Menu class="w-56" v-bind="$attrs">
      <MenuLabel>Clipboard</MenuLabel>
      <MenuItem>
        Cut
        <MenuShortcut>⌘X</MenuShortcut>
      </MenuItem>
      <MenuItem>
        Copy
        <MenuShortcut>⌘C</MenuShortcut>
      </MenuItem>
      <MenuItem>
        Paste
        <MenuShortcut>⌘V</MenuShortcut>
      </MenuItem>
      <MenuSeparator />
      <MenuSub>
        <MenuSubTrigger>Transform</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Uppercase</MenuItem>
          <MenuItem>Lowercase</MenuItem>
          <MenuItem>Title case</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem color="destructive">Delete</MenuItem>
    </Menu>
  </Button>
</template>
