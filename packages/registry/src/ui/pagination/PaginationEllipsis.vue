<script setup lang="ts">
import { PaginationEllipsis, type PaginationEllipsisProps } from "@delta-ui/core/pagination";
import { Ellipsis } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type PaginationSize, injectPaginationLook, paginationEllipsisSize } from ".";

const props = defineProps<PaginationEllipsisProps & { size?: PaginationSize; class?: HTMLAttributes["class"] }>();

const look = injectPaginationLook();
const size = computed(() => props.size ?? look.value.size);

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <PaginationEllipsis
    v-bind="delegated"
    data-slot="pagination-ellipsis"
    :data-size="size"
    :class="cn('flex items-center justify-center text-muted-foreground', paginationEllipsisSize[size], props.class)"
  >
    <slot>
      <Ellipsis aria-hidden="true" />
      <span class="sr-only">More pages</span>
    </slot>
  </PaginationEllipsis>
</template>
