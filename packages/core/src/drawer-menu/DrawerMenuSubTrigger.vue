<script setup lang="ts">
import { watchEffect } from "vue";

import { type DrawerMenuItemProps, injectDrawerMenuContext, injectDrawerMenuSubContext } from "./context";
import DrawerMenuItemImpl from "./DrawerMenuItemImpl.vue";

const props = withDefaults(defineProps<DrawerMenuItemProps>(), { as: "div" });

const menu = injectDrawerMenuContext();
const sub = injectDrawerMenuSubContext();

watchEffect(() => {
  sub.textValue.value = props.textValue;
});

const openSub = () => {
  if (props.disabled || menu.dragged()) return;
  sub.open.value = true;
};

const onKeydown = (event: KeyboardEvent) => {
  const forward = menu.dir.value === "rtl" ? "ArrowLeft" : "ArrowRight";
  if (props.disabled || event.key !== forward) return;
  event.preventDefault();
  sub.open.value = true;
};
</script>

<template>
  <DrawerMenuItemImpl
    v-bind="props"
    :id="sub.entry.triggerId"
    role="menuitem"
    aria-haspopup="menu"
    :aria-expanded="sub.open.value"
    :aria-controls="sub.open.value ? sub.entry.contentId : undefined"
    :data-state="sub.open.value ? 'open' : 'closed'"
    @click="openSub"
    @keydown="onKeydown"
  >
    <slot />
  </DrawerMenuItemImpl>
</template>
