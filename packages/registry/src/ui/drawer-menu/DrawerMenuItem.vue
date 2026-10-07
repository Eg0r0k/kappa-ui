<script setup lang="ts">
import { DrawerMenuItem, type DrawerMenuItemEmits, type DrawerMenuItemProps } from "@kappa-ui/core/drawer-menu";
import { useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { drawerMenuItem } from ".";

const props = defineProps<
  DrawerMenuItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<DrawerMenuItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, variant: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DrawerMenuItem
    v-ripple
    v-bind="forwarded"
    data-slot="drawer-menu-item"
    :data-inset="props.inset || undefined"
    :data-variant="props.variant ?? 'default'"
    :class="cn(drawerMenuItem, props.class)"
  >
    <slot />
  </DrawerMenuItem>
</template>
