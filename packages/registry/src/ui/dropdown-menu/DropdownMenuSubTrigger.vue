<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { DropdownMenuSubTrigger, type DropdownMenuSubTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { dropdownMenuSubTrigger } from ".";

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
    :class="cn(dropdownMenuSubTrigger, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </DropdownMenuSubTrigger>
</template>
