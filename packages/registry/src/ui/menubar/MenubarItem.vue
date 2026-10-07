<script setup lang="ts">
import { MenubarItem, type MenubarItemEmits, type MenubarItemProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { menuItem } from "@/ui/menu";

const props = defineProps<
  MenubarItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<MenubarItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, variant: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarItem
    v-ripple
    v-bind="forwarded"
    data-slot="menubar-item"
    :data-inset="props.inset || undefined"
    :data-variant="props.variant ?? 'default'"
    :class="cn(menuItem, props.class)"
  >
    <slot />
  </MenubarItem>
</template>
