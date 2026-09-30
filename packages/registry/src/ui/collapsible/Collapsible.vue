<script setup lang="ts">
import { CollapsibleRoot, type CollapsibleRootEmits, type CollapsibleRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<CollapsibleRootProps & { class?: HTMLAttributes["class"] }>(), {
  unmountOnHide: false,
});
const emits = defineEmits<CollapsibleRootEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <CollapsibleRoot v-slot="slotProps" v-bind="forwarded" data-slot="collapsible" :class="cn(props.class)">
    <slot v-bind="slotProps" />
  </CollapsibleRoot>
</template>
