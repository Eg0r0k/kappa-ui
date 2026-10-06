<script setup lang="ts">
import { NavigationMenuList, type NavigationMenuListProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<NavigationMenuListProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

/* Reka moves between top-level items with ArrowLeft and ArrowRight in screen order only for left-to-right
   text. In right-to-left text this swaps them, so ArrowLeft goes to the item on the left (the next one).
   It runs before Reka's handler and stops the event, so a fix upstream can't swap them twice. */
const mirrorArrowsInRtl = (event: KeyboardEvent) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const list = event.currentTarget as HTMLElement;
  if (list.getAttribute("data-orientation") !== "horizontal") return;
  if (list.closest("[data-reka-navigation-menu]")?.getAttribute("dir") !== "rtl") return;

  const items = [
    ...list.querySelectorAll<HTMLElement>(":scope > [data-menu-item] > [data-reka-collection-item]"),
  ].filter((item) => !item.hasAttribute("disabled"));
  const index = items.indexOf(event.target as HTMLElement);
  if (index === -1) return;

  event.preventDefault();
  event.stopPropagation();
  items[event.key === "ArrowLeft" ? index + 1 : index - 1]?.focus();
};
</script>

<template>
  <NavigationMenuList
    v-bind="delegated"
    data-slot="navigation-menu-list"
    :class="
      cn(
        `
          flex list-none flex-nowrap items-center gap-1
          data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch
        `,
        props.class,
      )
    "
    @keydown.capture="mirrorArrowsInRtl"
  >
    <slot />
  </NavigationMenuList>
</template>
