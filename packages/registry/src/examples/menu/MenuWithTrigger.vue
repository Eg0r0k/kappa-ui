<script setup lang="ts">
import { Button } from "@/ui/button";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/ui/menu";
</script>

<template>
  <MenuTrigger as-child>
    <Button variant="outline" color="neutral">Options</Button>
  </MenuTrigger>
  <Menu class="w-48">
    <MenuItem>Rename</MenuItem>
    <MenuItem>Duplicate</MenuItem>
    <MenuSeparator />
    <MenuItem variant="destructive">Delete</MenuItem>
  </Menu>
</template>
