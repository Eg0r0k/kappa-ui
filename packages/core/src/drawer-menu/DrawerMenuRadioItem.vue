<script setup lang="ts">
import { computed } from "vue";

import {
  type DrawerMenuRadioItemEmits,
  type DrawerMenuRadioItemProps,
  checkedState,
  injectDrawerMenuContext,
  injectDrawerMenuRadioGroupContext,
  provideDrawerMenuItemIndicatorContext,
} from "./context";
import DrawerMenuItemImpl from "./DrawerMenuItemImpl.vue";

const props = withDefaults(defineProps<DrawerMenuRadioItemProps>(), { as: "div" });
const emits = defineEmits<DrawerMenuRadioItemEmits>();

const menu = injectDrawerMenuContext();
const group = injectDrawerMenuRadioGroupContext();
const state = computed(() => group.modelValue.value === props.value);

provideDrawerMenuItemIndicatorContext({ state });

const onClick = () => {
  if (props.disabled) return;
  void menu.select((event) => {
    emits("select", event);
    group.onValueChange(props.value);
  });
};
</script>

<template>
  <DrawerMenuItemImpl
    :as="props.as"
    :as-child="props.asChild"
    :disabled="props.disabled"
    :text-value="props.textValue"
    role="menuitemradio"
    :aria-checked="state"
    :data-state="checkedState(state)"
    @click="onClick"
  >
    <slot />
  </DrawerMenuItemImpl>
</template>
