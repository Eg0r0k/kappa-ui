<script setup lang="ts">
import {
  NavigationMenuLink,
  type NavigationMenuLinkEmits,
  type NavigationMenuLinkProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import {
  injectNavigationMenuContext,
  injectNavigationMenuInContent,
  navigationMenuPanelLink,
  navigationMenuTriggerStyle,
} from ".";

const props = defineProps<
  NavigationMenuLinkProps & {
    /** Keeps the link focusable but stops it from navigating or closing the menu. */
    disabled?: boolean;
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<NavigationMenuLinkEmits>();

const context = injectNavigationMenuContext();
const inContent = injectNavigationMenuInContent(null) === true;

const delegated = computed(() => {
  const { class: _, disabled: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const linkClass = computed(() =>
  inContent
    ? navigationMenuPanelLink
    : navigationMenuTriggerStyle({ size: context.size.value, variant: context.variant.value }),
);

// Runs before Reka's click handler, so a disabled link neither navigates nor closes the menu.
const swallowWhenDisabled = (event: MouseEvent) => {
  if (!props.disabled) return;
  event.preventDefault();
  event.stopImmediatePropagation();
};
</script>

<template>
  <NavigationMenuLink
    v-bind="forwarded"
    data-slot="navigation-menu-link"
    :aria-disabled="props.disabled || undefined"
    :class="cn(linkClass, props.class)"
    @click.capture="swallowWhenDisabled"
  >
    <slot />
  </NavigationMenuLink>
</template>
