<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";

import { cycleSnapPoint } from "../snap";
import { injectDrawerRootContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });
const context = injectDrawerRootContext();

const onClick = () => {
  if (context.dragged.value) return;
  const points = context.snapPoints.value;
  if (points.length > 0) {
    context.activeSnapPoint.value = cycleSnapPoint(points, context.activeSnapPoint.value) ?? null;
    return;
  }
  if (context.dismissible.value) context.setOpen(false);
};
</script>

<template>
  <Primitive v-bind="props" data-drawer-handle aria-hidden="true" @click="onClick">
    <slot />
  </Primitive>
</template>
