<script setup lang="ts">
import { ContextMenuLabel, type ContextMenuLabelProps } from "@kappa-ui/core/context-menu";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { contextMenuLabel } from ".";

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
    :class="cn(contextMenuLabel, props.class)"
  >
    <slot />
  </ContextMenuLabel>
</template>
