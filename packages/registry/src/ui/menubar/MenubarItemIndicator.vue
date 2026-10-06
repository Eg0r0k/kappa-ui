<script setup lang="ts">
import { MenubarItemIndicator, type MenubarItemIndicatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuIndicator } from "@/ui/menu";

const props = defineProps<MenubarItemIndicatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <span :class="cn(menuIndicator, props.class)">
    <MenubarItemIndicator
      v-bind="delegated"
      data-slot="menubar-item-indicator"
      class="flex items-center justify-center"
    >
      <slot />
    </MenubarItemIndicator>
  </span>
</template>
