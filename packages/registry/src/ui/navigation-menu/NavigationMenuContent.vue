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

/* Reka moves between a panel's links with ArrowLeft and ArrowRight as if text always ran left to right. In
   right-to-left text this swaps them, as NavigationMenuList does for the top-level items. It runs before
   Reka's handler and stops the event, so a fix upstream can't swap them twice. Text fields keep their arrows. */
const mirrorArrowsInRtl = (event: KeyboardEvent) => {
  if (context.dir.value !== "rtl" || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
  const panel = event.currentTarget as HTMLElement;
  const target = event.target as HTMLElement;
  if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") return;
  if (target.closest("[data-slot=navigation-menu-content]") !== panel) return;

  // The same candidates as Reka's: anything tabbable that isn't disabled or hidden.
  const candidates = [...panel.querySelectorAll<HTMLElement>("*")].filter(
    (node) =>
      node.tabIndex >= 0 &&
      !(node as HTMLButtonElement).disabled &&
      !node.hidden &&
      !(node instanceof HTMLInputElement && node.type === "hidden"),
  );
  if (!candidates.length) return;
  event.preventDefault();
  event.stopPropagation();
  const index = candidates.indexOf(target);
  const forward = event.key === "ArrowLeft";
  const next = index === -1 ? (forward ? 0 : candidates.length - 1) : forward ? index + 1 : index - 1;
  candidates[next]?.focus();
};
</script>

<template>
  <NavigationMenuContent
    v-bind="forwarded"
    data-slot="navigation-menu-content"
    :class="cn(context.viewport.value ? navigationMenuContent.viewport : navigationMenuContent.inline, props.class)"
    @keydown="keepSpaceInPanel"
    @keydown.capture="mirrorArrowsInRtl"
  >
    <slot />
  </NavigationMenuContent>
</template>
