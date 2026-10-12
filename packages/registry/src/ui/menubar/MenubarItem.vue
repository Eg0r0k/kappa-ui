<script setup lang="ts">
import { MenubarItem, type MenubarItemEmits, type MenubarItemProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { type MenuItemColor, menuItem } from "@/ui/menu";

const props = defineProps<
  MenubarItemProps & {
    inset?: boolean;
    color?: MenuItemColor | (string & {});
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<MenubarItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, color: ___, ...rest } = props;
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
    :data-color="props.color"
    :class="cn(menuItem, props.class)"
  >
    <slot />
  </MenubarItem>
</template>
