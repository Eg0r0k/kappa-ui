<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from "@kappa-ui/core/dropdown-menu";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSeparator } from "@/ui/menu";

const props = defineProps<DropdownMenuSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <DropdownMenuSeparator
    v-bind="delegated"
    data-slot="dropdown-menu-separator"
    :class="cn(menuSeparator, props.class)"
  />
</template>
