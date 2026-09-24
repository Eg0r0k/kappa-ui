<script setup lang="ts">
import {
  MenuSeparator,
  type MenuSeparatorProps,
} from "reka-ui/internal";
import { type HTMLAttributes, computed } from "vue";

import { menuSeparator } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<MenuSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenuSeparator v-bind="delegated" data-slot="menu-separator" :class="cn(menuSeparator, props.class)" />
</template>
