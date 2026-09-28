<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { dropdownMenuSeparator } from ".";

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
    :class="cn(dropdownMenuSeparator, props.class)"
  />
</template>
