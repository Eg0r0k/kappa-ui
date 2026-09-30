<script setup lang="ts">
import { Hand, MousePointer2, Pencil, Square, Trash2, Type } from "@lucide/vue";

import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem } from "@/ui/toolbar";
</script>

<template>
  <Toolbar orientation="vertical" aria-label="Tools">
    <ToolbarToggleGroup type="single" default-value="select" aria-label="Tool" size="icon-sm">
      <ToolbarToggleItem value="select" aria-label="Select"><MousePointer2 /></ToolbarToggleItem>
      <ToolbarToggleItem value="hand" aria-label="Pan"><Hand /></ToolbarToggleItem>
      <ToolbarToggleItem value="pencil" aria-label="Draw"><Pencil /></ToolbarToggleItem>
      <ToolbarToggleItem value="shape" aria-label="Shape"><Square /></ToolbarToggleItem>
      <ToolbarToggleItem value="text" aria-label="Text"><Type /></ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarButton size="icon-sm" color="destructive" aria-label="Delete"><Trash2 /></ToolbarButton>
  </Toolbar>
</template>
