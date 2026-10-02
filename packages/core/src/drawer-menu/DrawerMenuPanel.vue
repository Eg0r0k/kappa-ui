<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { RovingFocusGroup } from "reka-ui";
import { nextTick, onMounted, ref, watch } from "vue";

import { type DrawerMenuMotion, injectDrawerMenuContext } from "./context";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ active: boolean }>();
const emits = defineEmits<{ hidden: [] }>();

const menu = injectDrawerMenuContext();
const element = ref<HTMLElement>();
const motion = ref<DrawerMenuMotion>();
const leaving = ref(false);

const settle = () => {
  leaving.value = false;
  emits("hidden");
};

watch(
  () => props.active,
  (active) => {
    const forward = menu.navigation.value === "forward";
    if (active) motion.value = forward ? "from-end" : "from-start";
    else motion.value = forward ? "to-start" : "to-end";
    leaving.value = !active;
  },
);

watch(leaving, async (value) => {
  if (!value) return;
  await nextTick();
  const node = element.value;
  if (!node || node.getAnimations().length === 0) settle();
});

const onMotionEnd = (event: Event) => {
  if (event.target === event.currentTarget && leaving.value) settle();
};

const measure = () => {
  if (props.active && element.value) menu.height.value = element.value.offsetHeight;
};

onMounted(measure);
useResizeObserver(element, measure);
watch(() => props.active, measure, { flush: "post" });
</script>

<template>
  <RovingFocusGroup as-child orientation="vertical" :loop="menu.loop.value" :dir="menu.dir.value">
    <div
      ref="element"
      v-bind="$attrs"
      role="menu"
      aria-orientation="vertical"
      data-drawer-menu-panel
      :data-state="props.active ? 'active' : 'inactive'"
      :data-motion="motion"
      :hidden="!props.active && !leaving"
      :inert="!props.active || undefined"
      @animationend="onMotionEnd"
      @animationcancel="onMotionEnd"
      @transitionend="onMotionEnd"
      @transitioncancel="onMotionEnd"
    >
      <slot />
    </div>
  </RovingFocusGroup>
</template>
