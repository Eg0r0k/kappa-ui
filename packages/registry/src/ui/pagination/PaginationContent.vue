<script setup lang="ts">
import { PaginationList, type PaginationListProps } from "@delta-ui/core/pagination";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<PaginationListProps & { class?: HTMLAttributes["class"] }>(), { as: "ul" });

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <PaginationList
    v-slot="slotProps"
    v-bind="delegated"
    data-slot="pagination-content"
    :class="cn('flex flex-row items-center gap-1', props.class)"
  >
    <slot v-bind="slotProps" />
  </PaginationList>
</template>
