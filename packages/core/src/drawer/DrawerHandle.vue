<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";

import { injectDrawerRootContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });
const context = injectDrawerRootContext();

const onClick = () => {
  if (context.dragged.value || !context.dismissible.value) return;
  context.setOpen(false);
};
</script>

<template>
  <Primitive v-bind="props" data-drawer-handle aria-hidden="true" @click="onClick">
    <slot />
  </Primitive>
</template>
