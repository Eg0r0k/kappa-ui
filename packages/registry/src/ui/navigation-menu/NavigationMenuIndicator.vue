<script setup lang="ts">
import { NavigationMenuIndicator, type NavigationMenuIndicatorProps } from "reka-ui";
import { type HTMLAttributes, computed, watchEffect } from "vue";

import { cn } from "@/lib/utils";
import {
  injectNavigationMenuContext,
  navigationMenuArrow,
  navigationMenuIndicator,
  warnIndicatorWithoutViewport,
} from ".";

const props = defineProps<NavigationMenuIndicatorProps & { class?: HTMLAttributes["class"] }>();

const context = injectNavigationMenuContext();

watchEffect(() => {
  if (!context.viewport.value) warnIndicatorWithoutViewport();
});

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <NavigationMenuIndicator
    v-if="context.viewport.value"
    v-bind="delegated"
    data-slot="navigation-menu-indicator"
    :class="cn('group/navigation-menu-indicator', navigationMenuIndicator, props.class)"
  >
    <slot>
      <div :class="navigationMenuArrow" />
    </slot>
  </NavigationMenuIndicator>
</template>
