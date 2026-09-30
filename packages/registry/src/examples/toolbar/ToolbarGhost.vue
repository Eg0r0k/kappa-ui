<script setup lang="ts">
import { Redo2, Undo2 } from "@lucide/vue";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/ui/toolbar";
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>Draft</CardTitle>
      <Toolbar variant="ghost" aria-label="History">
        <ToolbarButton size="icon-sm" aria-label="Undo"><Undo2 /></ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Redo"><Redo2 /></ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton variant="outline">Publish</ToolbarButton>
      </Toolbar>
    </CardHeader>
    <CardContent class="text-body-md text-muted-foreground">
      A ghost toolbar has no frame of its own, so it sits in a card header or a page header as a row of buttons that
      still moves focus with the arrow keys.
    </CardContent>
  </Card>
</template>
