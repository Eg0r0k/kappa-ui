<script setup lang="ts">
import {
  CollapsibleContent,
  type CollapsibleContentEmits,
  type CollapsibleContentProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<CollapsibleContentEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <CollapsibleContent
    v-bind="forwarded"
    data-slot="collapsible-content"
    :class="
      cn(
        'text-body-md data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
        props.class,
      )
    "
  >
    <slot />
  </CollapsibleContent>
</template>
