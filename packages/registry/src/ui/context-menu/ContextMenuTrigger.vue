<script setup lang="ts">
import { ContextMenuTrigger, type ContextMenuTriggerProps } from "@delta-ui/core/context-menu";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ContextMenuTrigger v-bind="delegated" data-slot="context-menu-trigger" :class="cn(props.class)">
    <slot />
  </ContextMenuTrigger>
</template>
