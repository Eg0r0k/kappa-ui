<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";

import { provideSwipeRootContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });

const closers = new Set<() => void>();

provideSwipeRootContext({
  register: (close) => {
    closers.add(close);
    return () => closers.delete(close);
  },
  opened: (close) => {
    for (const other of closers) if (other !== close) other();
  },
});
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild">
    <slot />
  </Primitive>
</template>
