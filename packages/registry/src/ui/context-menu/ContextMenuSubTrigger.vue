<script setup lang="ts">
import {
  ContextMenuSubTrigger,
  type ContextMenuSubTriggerProps,
} from "@delta-ui/core/context-menu";
import { ChevronRight } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { menuSubTrigger } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuSubTriggerProps & { inset?: boolean; class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, inset: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <ContextMenuSubTrigger
    v-bind="delegated"
    data-slot="context-menu-sub-trigger"
    :data-inset="props.inset || undefined"
    :class="cn(menuSubTrigger, props.class)"
  >
    <slot />
    <ChevronRight class="ms-auto text-muted-foreground rtl:rotate-180" />
  </ContextMenuSubTrigger>
</template>
