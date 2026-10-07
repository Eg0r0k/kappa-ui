<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { MenubarSubTrigger, type MenubarSubTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { menuSubTrigger } from "@/ui/menu";

const props = defineProps<MenubarSubTriggerProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenubarSubTrigger
    v-ripple
    v-bind="delegated"
    data-slot="menubar-sub-trigger"
    :data-inset="props.inset || undefined"
    :class="cn(menuSubTrigger, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </MenubarSubTrigger>
</template>
