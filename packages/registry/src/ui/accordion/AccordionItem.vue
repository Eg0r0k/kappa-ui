<script setup lang="ts">
import { AccordionItem, type AccordionItemProps } from "@delta-ui/core/accordion";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>(), {
  disabled: false,
  unmountOnHide: undefined,
});

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <AccordionItem
    v-slot="slotProps"
    v-bind="delegated"
    data-slot="accordion-item"
    :class="cn('border-b border-border last:border-b-0', props.class)"
  >
    <slot v-bind="slotProps" />
  </AccordionItem>
</template>
