<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight } from "@lucide/vue";

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
</script>

<template>
  <ToggleGroup type="single" default-value="left" size="icon-md" active-variant="solid" active-color="primary">
    <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="Align centre"><AlignCenter /></ToggleGroupItem>
    <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
  </ToggleGroup>
</template>
