<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { DrawerMenuSubTrigger, type DrawerMenuItemProps } from "@kappa-ui/core/drawer-menu";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { drawerMenuItem } from ".";

const props = defineProps<DrawerMenuItemProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <DrawerMenuSubTrigger
    v-bind="delegated"
    data-slot="drawer-menu-sub-trigger"
    :data-inset="props.inset || undefined"
    :class="cn(drawerMenuItem, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </DrawerMenuSubTrigger>
</template>
