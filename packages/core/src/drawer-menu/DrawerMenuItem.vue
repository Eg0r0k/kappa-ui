<script setup lang="ts">
import { type DrawerMenuItemEmits, type DrawerMenuItemProps, injectDrawerMenuContext } from "./context";
import DrawerMenuItemImpl from "./DrawerMenuItemImpl.vue";

const props = withDefaults(defineProps<DrawerMenuItemProps>(), { as: "div" });
const emits = defineEmits<DrawerMenuItemEmits>();

const menu = injectDrawerMenuContext();

const onClick = () => {
  if (!props.disabled) void menu.select((event) => emits("select", event));
};
</script>

<template>
  <DrawerMenuItemImpl v-bind="props" role="menuitem" @click="onClick">
    <slot />
  </DrawerMenuItemImpl>
</template>
