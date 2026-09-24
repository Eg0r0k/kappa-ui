<script setup lang="ts">
import { ContextMenuLabel, type ContextMenuLabelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { menuLabel } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuLabelProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <ContextMenuLabel
    v-bind="delegated"
    data-slot="context-menu-label"
    :data-inset="props.inset || undefined"
    :class="cn(menuLabel, props.class)"
  >
    <slot />
  </ContextMenuLabel>
</template>
