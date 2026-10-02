<script setup lang="ts">
import { Primitive, injectDialogRootContext, useDirection } from "reka-ui";
import { type ComponentPublicInstance, computed, nextTick, ref, shallowRef, toRef } from "vue";

import { injectDrawerRootContext } from "../drawer";
import { type DrawerMenuProps, type DrawerMenuSubEntry, provideDrawerMenuContext } from "./context";
import DrawerMenuPanel from "./DrawerMenuPanel.vue";

const props = withDefaults(defineProps<DrawerMenuProps>(), { loop: false });

const dialog = injectDialogRootContext(null);
const drawer = injectDrawerRootContext(null);
const dir = useDirection(toRef(() => props.dir));

const root = ref<ComponentPublicInstance>();
const outlet = ref<HTMLElement>();
const stack = shallowRef<DrawerMenuSubEntry[]>([]);
const navigation = ref<"forward" | "back">("forward");
const height = ref<number>();

const resetScroll = () => {
  const node = root.value?.$el;
  if (node instanceof HTMLElement) node.scrollTop = 0;
};

const firstItem = (panel: HTMLElement | null) =>
  panel?.querySelector<HTMLElement>("[role^=menuitem]:not([data-drawer-menu-back]):not([data-disabled])");

const push = (entry: DrawerMenuSubEntry) => {
  if (stack.value.includes(entry)) return;
  navigation.value = "forward";
  stack.value = [...stack.value, entry];
  resetScroll();
  void nextTick(() => firstItem(document.getElementById(entry.contentId))?.focus());
};

const visiblePanel = () => {
  const top = stack.value.at(-1);
  if (top) return document.getElementById(top.contentId);
  const node = root.value?.$el;
  return node instanceof HTMLElement ? node.querySelector<HTMLElement>(":scope > [data-drawer-menu-panel]") : null;
};

const restoreFocus = (entry: DrawerMenuSubEntry) => {
  const trigger = document.getElementById(entry.triggerId);
  if (trigger) {
    trigger.focus();
    return;
  }
  firstItem(visiblePanel())?.focus();
};

const remove = (entry: DrawerMenuSubEntry) => {
  const index = stack.value.indexOf(entry);
  if (index === -1) return;
  const above = stack.value.slice(index + 1);
  navigation.value = "back";
  stack.value = stack.value.slice(0, index);
  above.forEach((sub) => sub.close());
  resetScroll();
  void nextTick(() => restoreFocus(entry));
};

const select = async (emit: (event: Event) => void) => {
  if (drawer?.dragged.value) return;
  const event = new CustomEvent("drawer-menu.select", { bubbles: true, cancelable: true });
  emit(event);
  await nextTick();
  if (!event.defaultPrevented) dialog?.onOpenChange(false);
};

provideDrawerMenuContext({
  outlet,
  stack,
  navigation,
  height,
  loop: computed(() => props.loop),
  dir,
  push,
  remove,
  select,
  dragged: () => drawer?.dragged.value ?? false,
});

const backKeys = computed(() => ["Escape", "Backspace", dir.value === "rtl" ? "ArrowRight" : "ArrowLeft"]);

const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || target.matches("input, textarea, select"));

const onKeydown = (event: KeyboardEvent) => {
  const top = stack.value.at(-1);
  if (!top || !backKeys.value.includes(event.key)) return;
  if (event.key !== "Escape" && editable(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  top.close();
};
</script>

<template>
  <Primitive
    ref="root"
    :as="props.as"
    :as-child="props.asChild"
    :dir="dir"
    :style="height === undefined ? undefined : { '--drawer-menu-height': `${height}px` }"
    @keydown="onKeydown"
  >
    <DrawerMenuPanel :active="stack.length === 0" :aria-labelledby="dialog?.titleId || undefined">
      <slot />
    </DrawerMenuPanel>
    <div ref="outlet" style="display: contents" />
  </Primitive>
</template>
