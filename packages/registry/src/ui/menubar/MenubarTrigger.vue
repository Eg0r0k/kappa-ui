<script setup lang="ts">
import { MenubarTrigger, type MenubarTriggerProps, injectMenubarMenuContext, useId } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menubarTrigger } from ".";

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

// Reka names the menu when its content first renders, after the trigger, so a menu open on first render
// (default-value, v-model) left an empty aria-controls on its trigger. Naming it here links them from the start.
const menuContext = injectMenubarMenuContext();
menuContext.contentId ||= useId(undefined, "reka-menubar-content");
</script>

<template>
  <MenubarTrigger v-bind="delegated" data-slot="menubar-trigger" :class="cn(menubarTrigger, props.class)">
    <slot />
  </MenubarTrigger>
</template>
