<script setup lang="ts">
import { MenuSubTrigger, type MenuSubTriggerProps } from "@delta-ui/core/menu";
import { ChevronRight } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { menuSubTrigger } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<MenuSubTriggerProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenuSubTrigger
    v-bind="delegated"
    data-slot="menu-sub-trigger"
    :data-inset="props.inset || undefined"
    :class="cn(menuSubTrigger, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </MenuSubTrigger>
</template>
