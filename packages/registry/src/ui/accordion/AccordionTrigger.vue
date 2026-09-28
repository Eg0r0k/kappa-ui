<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { AccordionHeader, AccordionTrigger, type AccordionTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <AccordionHeader data-slot="accordion-header" class="flex">
    <AccordionTrigger
      v-bind="delegated"
      data-slot="accordion-trigger"
      :class="
        cn(
          'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-start text-title-sm outline-none hover:underline focus-visible:focus-ring data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity) [&[data-state=open]>svg]:rotate-180',
          props.class,
        )
      "
    >
      <slot />
      <slot name="icon">
        <ChevronDown
          class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-short-4 ease-standard"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
