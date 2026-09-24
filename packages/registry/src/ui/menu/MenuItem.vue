<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import {
  MenuItem,
  type MenuItemEmits,
  type MenuItemProps,
} from "reka-ui/internal";
import { type HTMLAttributes, computed } from "vue";

import { menuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

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
