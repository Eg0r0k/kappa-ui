<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { menuLabel } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuLabelProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <DropdownMenuLabel
    v-bind="delegated"
    data-slot="dropdown-menu-label"
    :data-inset="props.inset || undefined"
    :class="cn(menuLabel, props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
