<script setup lang="ts">
import { NavigationMenuViewport, type NavigationMenuViewportProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectNavigationMenuContext, navigationMenuViewport, navigationMenuViewportWrapper } from ".";

const props = withDefaults(
  defineProps<
    NavigationMenuViewportProps & {
      /** Where the panel lines up with its trigger: `start` and `end` follow the reading direction. */
      align?: "start" | "center" | "end";
      class?: HTMLAttributes["class"];
    }
  >(),
  { align: "center" },
);

const context = injectNavigationMenuContext(null);

/* Reka's horizontal `align` is physical (`start` is the left edge), so swap it in right-to-left text. In a
   vertical menu it lines up top or bottom edges, which don't depend on the reading direction. */
const physicalAlign = computed(() => {
  if (context?.dir.value !== "rtl" || context.orientation.value !== "horizontal" || props.align === "center")
    return props.align;
  return props.align === "start" ? "end" : "start";
});

const delegated = computed(() => {
  const { class: _, align: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <div data-slot="navigation-menu-viewport-wrapper" :class="navigationMenuViewportWrapper">
    <NavigationMenuViewport
      v-bind="delegated"
      :align="physicalAlign"
      data-slot="navigation-menu-viewport"
      :class="cn(navigationMenuViewport, props.class)"
    />
  </div>
</template>
