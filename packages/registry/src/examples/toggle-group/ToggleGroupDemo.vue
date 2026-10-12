<script setup lang="ts">
import { Bold, Italic, Underline } from "@lucide/vue";

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <ToggleGroup type="multiple" variant="outline" size="icon-md" v-bind="$attrs">
    <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
    <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
    <ToggleGroupItem value="underline" aria-label="Underline"><Underline /></ToggleGroupItem>
  </ToggleGroup>
</template>
