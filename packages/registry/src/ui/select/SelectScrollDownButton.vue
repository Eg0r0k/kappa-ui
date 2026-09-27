<script setup lang="ts">
import { SelectScrollDownButton, type SelectScrollDownButtonProps } from "@kappa-ui/core/select";
import { ChevronDown } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <SelectScrollDownButton
    v-bind="delegated"
    data-slot="select-scroll-down-button"
    :class="
      cn(
        'flex shrink-0 cursor-default items-center justify-center py-1 text-muted-foreground [&_svg:not([class*=size-])]:size-4',
        props.class,
      )
    "
  >
    <slot>
      <ChevronDown />
    </slot>
  </SelectScrollDownButton>
</template>
