<script setup lang="ts">
import { RovingFocusItem } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectPageIndicatorContext, pageIndicatorItemVariants } from ".";

const props = defineProps<{ value: number; class?: HTMLAttributes["class"] }>();

const context = injectPageIndicatorContext();

const state = computed(() => {
  if (props.value === context.page.value) return "active";
  if (props.value < context.page.value) return "completed";
  return "inactive";
});

const item = computed(() => {
  const { variant, orientation, cumulative, touchTarget } = context.look.value;
  return {
    "data-slot": "page-indicator-item",
    "data-state": state.value,
    "data-orientation": orientation,
    class: cn(pageIndicatorItemVariants({ variant, orientation, cumulative, touchTarget }), props.class),
  };
});
</script>

<template>
  <span v-if="context.look.value.readonly" v-bind="item" />
  <RovingFocusItem
    v-else
    v-bind="item"
    as="button"
    type="button"
    :tab-stop-id="String(props.value)"
    :active="state === 'active'"
    :aria-label="`Page ${props.value}`"
    :aria-current="state === 'active' ? 'true' : undefined"
    @click="context.select(props.value)"
  />
</template>
