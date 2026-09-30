<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Share2, Underline } from "@lucide/vue";

import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "@/ui/toolbar";
</script>

<template>
  <Toolbar aria-label="Formatting">
    <ToolbarToggleGroup type="multiple" aria-label="Text style" size="icon-sm">
      <ToolbarToggleItem value="bold" aria-label="Bold"><Bold /></ToolbarToggleItem>
      <ToolbarToggleItem value="italic" aria-label="Italic"><Italic /></ToolbarToggleItem>
      <ToolbarToggleItem value="underline" aria-label="Underline"><Underline /></ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarToggleGroup type="single" default-value="left" aria-label="Alignment" size="icon-sm">
      <ToolbarToggleItem value="left" aria-label="Align left"><AlignLeft /></ToolbarToggleItem>
      <ToolbarToggleItem value="center" aria-label="Align centre"><AlignCenter /></ToolbarToggleItem>
      <ToolbarToggleItem value="right" aria-label="Align right"><AlignRight /></ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarLink href="#" class="text-muted-foreground">Edited 2 hours ago</ToolbarLink>
    <ToolbarButton variant="solid" color="primary" class="ms-auto">
      <Share2 data-icon="inline-start" />
      Share
    </ToolbarButton>
  </Toolbar>
</template>
