<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { NavigationMenuTrigger, type NavigationMenuTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectNavigationMenuContext, navigationMenuChevron, navigationMenuTriggerStyle } from ".";

const props = defineProps<NavigationMenuTriggerProps & { class?: HTMLAttributes["class"] }>();

const context = injectNavigationMenuContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <NavigationMenuTrigger
    v-bind="delegated"
    data-slot="navigation-menu-trigger"
    :class="cn(navigationMenuTriggerStyle({ size: context.size.value, variant: context.variant.value }), props.class)"
  >
    <slot />
    <slot name="icon">
      <ChevronDown aria-hidden="true" :class="navigationMenuChevron" />
    </slot>
  </NavigationMenuTrigger>
</template>
