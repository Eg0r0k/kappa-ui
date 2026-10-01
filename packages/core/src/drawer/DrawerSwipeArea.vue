<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ComponentPublicInstance, computed, ref } from "vue";

import { opposite, useDrag } from "../drag";
import { injectDrawerRootContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });
const context = injectDrawerRootContext();

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const vertical = computed(() => context.side.value === "bottom" || context.side.value === "top");
const extent = () => context.size.value || (vertical.value ? window.innerHeight : window.innerWidth);

useDrag(element, {
  towards: () => opposite(context.side.value),
  enabled: () => !context.open.value || context.swiping.value,
  bounds: () => ({ min: 0, max: extent() }),
  canStart: (move) => move.direction > 0,
  onStart: () => {
    context.swiping.value = true;
    context.movement.value = extent();
    context.setOpen(true);
  },
  onMove: (move) => {
    context.movement.value = Math.max(0, extent() - move.movement);
  },
  onRelease: (move) => {
    const size = extent();
    const revealed = Math.min(size, Math.max(0, move.movement));
    context.swiping.value = false;
    if (revealed >= 40 || move.velocity >= 0.1) {
      context.movement.value = 0;
      return;
    }
    context.movement.value = size - revealed;
    context.setOpen(false);
  },
  onCancel: () => {
    context.swiping.value = false;
    context.setOpen(false);
  },
});
</script>

<template>
  <Primitive :ref="setInstance" v-bind="props" :data-side="context.side.value" aria-hidden="true">
    <slot />
  </Primitive>
</template>
