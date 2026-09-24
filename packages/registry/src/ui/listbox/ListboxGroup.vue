<script setup lang="ts">
import { ListboxGroup, type ListboxGroupProps } from "@delta-ui/core/listbox";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ListboxGroupProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ListboxGroup v-bind="delegated" data-slot="listbox-group" :class="cn('flex flex-col gap-0.5', props.class)">
    <slot />
  </ListboxGroup>
</template>
