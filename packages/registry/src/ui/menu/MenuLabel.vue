<script setup lang="ts">
import { MenuLabel, type MenuLabelProps } from "@kappa-ui/core/menu";
import { type HTMLAttributes, computed } from "vue";

import { menuLabel } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<MenuLabelProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenuLabel
    v-bind="delegated"
    data-slot="menu-label"
    :data-inset="props.inset || undefined"
    :class="cn(menuLabel, props.class)"
  >
    <slot />
  </MenuLabel>
</template>
