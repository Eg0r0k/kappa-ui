<script setup lang="ts">
import { MenubarTrigger, type MenubarTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menubarTrigger } from ".";

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenubarTrigger v-bind="delegated" data-slot="menubar-trigger" :class="cn(menubarTrigger, props.class)">
    <slot />
  </MenubarTrigger>
</template>
