<script setup lang="ts">
import { NavigationMenuIndicator, type NavigationMenuIndicatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { navigationMenuArrow, navigationMenuIndicator } from ".";

const props = defineProps<NavigationMenuIndicatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <NavigationMenuIndicator
    v-bind="delegated"
    data-slot="navigation-menu-indicator"
    :class="cn('group/navigation-menu-indicator', navigationMenuIndicator, props.class)"
  >
    <slot>
      <div :class="navigationMenuArrow" />
    </slot>
  </NavigationMenuIndicator>
</template>
