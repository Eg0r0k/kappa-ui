<script setup lang="ts">
import { type DrawerMenuBackProps, injectDrawerMenuContext, injectDrawerMenuSubContext } from "./context";
import DrawerMenuItemImpl from "./DrawerMenuItemImpl.vue";

const props = withDefaults(defineProps<DrawerMenuBackProps>(), { as: "div" });

const menu = injectDrawerMenuContext();
const sub = injectDrawerMenuSubContext();

const back = () => {
  if (!menu.dragged()) sub.open.value = false;
};
</script>

<template>
  <DrawerMenuItemImpl v-bind="props" role="menuitem" data-drawer-menu-back @click="back">
    <slot :label="sub.label.value">{{ sub.label.value }}</slot>
  </DrawerMenuItemImpl>
</template>
