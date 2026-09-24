<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from "@delta-ui/core/dropdown-menu";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <DropdownMenuTrigger v-bind="delegated" data-slot="dropdown-menu-trigger" :class="cn(props.class)">
    <slot />
  </DropdownMenuTrigger>
</template>
