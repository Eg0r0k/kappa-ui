<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed } from "vue";

import {
  type DrawerMenuCheckboxItemEmits,
  type DrawerMenuCheckboxItemProps,
  checkedState,
  injectDrawerMenuContext,
  provideDrawerMenuItemIndicatorContext,
} from "./context";
import DrawerMenuItemImpl from "./DrawerMenuItemImpl.vue";

const props = withDefaults(defineProps<DrawerMenuCheckboxItemProps>(), { as: "div", modelValue: false });
const emits = defineEmits<DrawerMenuCheckboxItemEmits>();

const menu = injectDrawerMenuContext();
const modelValue = useVModel(props, "modelValue", emits);
const state = computed(() => modelValue.value ?? false);

provideDrawerMenuItemIndicatorContext({ state });

const onClick = () => {
  if (props.disabled) return;
  void menu.select((event) => {
    emits("select", event);
    modelValue.value = modelValue.value === "indeterminate" ? true : !modelValue.value;
  });
};
</script>

<template>
  <DrawerMenuItemImpl
    :as="props.as"
    :as-child="props.asChild"
    :disabled="props.disabled"
    :text-value="props.textValue"
    role="menuitemcheckbox"
    :aria-checked="state === 'indeterminate' ? 'mixed' : state"
    :data-state="checkedState(state)"
    @click="onClick"
  >
    <slot :model-value="state" />
  </DrawerMenuItemImpl>
</template>
