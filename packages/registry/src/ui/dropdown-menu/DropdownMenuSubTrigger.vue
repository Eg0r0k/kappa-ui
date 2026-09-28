<script setup lang="ts">
import { DropdownMenuSubTrigger, type DropdownMenuSubTriggerProps } from "@kappa-ui/core/dropdown-menu";
import { ChevronRight } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSubTrigger } from "@/ui/menu";

const props = defineProps<DropdownMenuSubTriggerProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <DropdownMenuSubTrigger
    v-bind="delegated"
    data-slot="dropdown-menu-sub-trigger"
    :data-inset="props.inset || undefined"
    :class="cn(menuSubTrigger, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </DropdownMenuSubTrigger>
</template>
