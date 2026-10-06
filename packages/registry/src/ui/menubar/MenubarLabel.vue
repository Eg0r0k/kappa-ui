<script setup lang="ts">
import { MenubarLabel, type MenubarLabelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuLabel } from "@/ui/menu";

const props = defineProps<MenubarLabelProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <MenubarLabel
    v-bind="delegated"
    data-slot="menubar-label"
    :data-inset="props.inset || undefined"
    :class="cn(menuLabel, props.class)"
  >
    <slot />
  </MenubarLabel>
</template>
