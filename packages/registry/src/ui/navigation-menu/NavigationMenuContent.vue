<script setup lang="ts">
import {
  NavigationMenuContent,
  type NavigationMenuContentEmits,
  type NavigationMenuContentProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectNavigationMenuContext, navigationMenuContent, provideNavigationMenuInContent } from ".";

const props = defineProps<NavigationMenuContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<NavigationMenuContentEmits>();

const context = injectNavigationMenuContext();
provideNavigationMenuInContent(true);

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

/* Without a viewport the panel renders inside its item, whose keydown handler closes the menu on Space, so
   Space never reaches an input or a button in the panel. Stop it at the panel; the trigger still toggles. */
const keepSpaceInPanel = (event: KeyboardEvent) => {
  if (event.key !== " " || event.target === event.currentTarget) return;
  if ((event.currentTarget as HTMLElement).closest("[data-menu-item]")) event.stopPropagation();
};
</script>

<template>
  <NavigationMenuContent
    v-bind="forwarded"
    data-slot="navigation-menu-content"
    :class="cn(context.viewport.value ? navigationMenuContent.viewport : navigationMenuContent.inline, props.class)"
    @keydown="keepSpaceInPanel"
  >
    <slot />
  </NavigationMenuContent>
</template>
