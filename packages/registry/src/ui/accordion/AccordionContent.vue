<script setup lang="ts">
import { AccordionContent, type AccordionContentProps } from "@delta-ui/core/accordion";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <AccordionContent
    v-bind="delegated"
    data-slot="accordion-content"
    class="overflow-hidden text-body-md data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
  >
    <div :class="cn('pb-4', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
