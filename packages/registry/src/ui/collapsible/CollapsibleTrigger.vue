<script setup lang="ts">
import { CollapsibleTrigger, type CollapsibleTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<CollapsibleTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CollapsibleTrigger v-bind="delegated" data-slot="collapsible-trigger" :class="cn(props.class)">
    <slot />
  </CollapsibleTrigger>
</template>
