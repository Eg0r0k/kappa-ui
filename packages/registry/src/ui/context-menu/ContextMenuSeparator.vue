<script setup lang="ts">
import { ContextMenuSeparator, type ContextMenuSeparatorProps } from "@kappa-ui/core/context-menu";
import { type HTMLAttributes, computed } from "vue";

import { menuSeparator } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ContextMenuSeparator v-bind="delegated" data-slot="context-menu-separator" :class="cn(menuSeparator, props.class)" />
</template>
