<script setup lang="ts">
import { MenubarSeparator, type MenubarSeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSeparator } from "@/ui/menu";

const props = defineProps<MenubarSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenubarSeparator v-bind="delegated" data-slot="menubar-separator" :class="cn(menuSeparator, props.class)" />
</template>
