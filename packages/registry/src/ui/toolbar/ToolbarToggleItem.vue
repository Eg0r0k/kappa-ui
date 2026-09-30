<script setup lang="ts">
import { type ToggleGroupItemProps, ToolbarButton } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { ToggleGroupItem, type ToggleGroupStyle } from "@/ui/toggle-group";

const props = defineProps<ToggleGroupItemProps & ToggleGroupStyle & { class?: HTMLAttributes["class"] }>();
</script>

<template>
  <ToolbarButton as-child :disabled="props.disabled">
    <ToggleGroupItem v-bind="props" data-slot="toolbar-toggle-item">
      <slot />
    </ToggleGroupItem>
  </ToolbarButton>
</template>
