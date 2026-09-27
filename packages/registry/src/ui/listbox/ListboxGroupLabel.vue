<script setup lang="ts">
import { ListboxGroupLabel, type ListboxGroupLabelProps } from "@kappa-ui/core/listbox";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ListboxGroupLabelProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ListboxGroupLabel
    v-bind="delegated"
    data-slot="listbox-group-label"
    :class="cn('px-3 pt-2 pb-1 text-label-md text-muted-foreground', props.class)"
  >
    <slot />
  </ListboxGroupLabel>
</template>
