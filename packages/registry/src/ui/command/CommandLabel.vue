<script setup lang="ts">
import { ListboxGroupLabel, type ListboxGroupLabelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuLabel } from "@/ui/menu";

const props = defineProps<ListboxGroupLabelProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ListboxGroupLabel v-bind="delegated" data-slot="command-label" :class="cn(menuLabel, props.class)">
    <slot />
  </ListboxGroupLabel>
</template>
