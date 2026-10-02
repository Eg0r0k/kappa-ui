<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useId } from "reka-ui";
import { type Ref, computed, onBeforeUnmount, ref, watch } from "vue";

import {
  type DrawerMenuSubEmits,
  type DrawerMenuSubEntry,
  type DrawerMenuSubProps,
  injectDrawerMenuContext,
  provideDrawerMenuSubContext,
} from "./context";

const props = withDefaults(defineProps<DrawerMenuSubProps>(), { open: undefined, defaultOpen: false });
const emits = defineEmits<DrawerMenuSubEmits>();

const menu = injectDrawerMenuContext();
const open = useVModel(props, "open", emits, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>;

const textValue = ref<string>();
const triggerText = ref("");
const label = computed(() => textValue.value ?? triggerText.value);
const entry: DrawerMenuSubEntry = {
  triggerId: useId(undefined, "kappa-drawer-menu-sub-trigger"),
  contentId: useId(undefined, "kappa-drawer-menu-sub-content"),
  close: () => {
    open.value = false;
  },
};

watch(
  open,
  (value) => {
    if (!value) return menu.remove(entry);
    menu.push(entry);
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => menu.remove(entry));

provideDrawerMenuSubContext({ open, label, textValue, triggerText, entry });
</script>

<template>
  <slot :open="open" />
</template>
