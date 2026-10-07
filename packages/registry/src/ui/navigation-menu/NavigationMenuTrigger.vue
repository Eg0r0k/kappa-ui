<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { NavigationMenuTrigger, type NavigationMenuTriggerProps, Primitive } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { injectNavigationMenuContext, navigationMenuChevron, navigationMenuTriggerStyle } from ".";

const props = withDefaults(defineProps<NavigationMenuTriggerProps & { class?: HTMLAttributes["class"] }>(), {
  as: "button",
});

const context = injectNavigationMenuContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <NavigationMenuTrigger v-bind="delegated" as-child>
    <Primitive
      v-ripple
      :as="props.as"
      :as-child="props.asChild"
      data-slot="navigation-menu-trigger"
      :class="cn(navigationMenuTriggerStyle({ size: context.size.value, variant: context.variant.value }), props.class)"
    >
      <slot />
      <slot name="icon">
        <ChevronDown aria-hidden="true" :class="navigationMenuChevron" />
      </slot>
    </Primitive>
  </NavigationMenuTrigger>
</template>
