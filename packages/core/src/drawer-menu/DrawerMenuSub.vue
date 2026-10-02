<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useId } from "reka-ui";
import { type Ref, onBeforeUnmount, ref, watch } from "vue";

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

const label = ref("");
const textValue = ref<string>();
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
    label.value = textValue.value ?? document.getElementById(entry.triggerId)?.textContent?.trim() ?? "";
    menu.push(entry);
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => menu.remove(entry, false));

provideDrawerMenuSubContext({ open, label, textValue, entry });
</script>

<template>
  <slot :open="open" />
</template>
