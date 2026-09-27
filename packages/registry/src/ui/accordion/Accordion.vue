<script setup lang="ts">
import { AccordionRoot, type AccordionRootEmits, type AccordionRootProps } from "@kappa-ui/core/accordion";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<AccordionRootProps & { class?: HTMLAttributes["class"] }>(), {
  collapsible: true,
  disabled: false,
  unmountOnHide: false,
  orientation: "vertical",
});
const emits = defineEmits<AccordionRootEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <AccordionRoot v-slot="slotProps" v-bind="forwarded" data-slot="accordion" :class="cn('w-full', props.class)">
    <slot v-bind="slotProps" />
  </AccordionRoot>
</template>
