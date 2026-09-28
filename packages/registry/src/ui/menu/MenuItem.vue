<script setup lang="ts">
import { MenuItem, type MenuItemEmits, type MenuItemProps } from "@kappa-ui/core/menu";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuItem } from ".";

const props = defineProps<
  MenuItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<MenuItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, variant: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenuItem
    v-bind="forwarded"
    data-slot="menu-item"
    :data-inset="props.inset || undefined"
    :data-variant="props.variant ?? 'default'"
    :class="cn(menuItem, props.class)"
  >
    <slot />
  </MenuItem>
</template>
