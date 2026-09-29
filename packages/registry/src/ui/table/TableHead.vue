<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableAlign, type TablePinned, tableStyles } from ".";

const props = defineProps<{
  align?: TableAlign;
  pinned?: TablePinned;
  pinnedEdge?: boolean;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <th
    scope="col"
    data-slot="table-head"
    :data-align="props.align"
    :data-pinned="props.pinned"
    :data-pinned-edge="props.pinnedEdge ? '' : undefined"
    :class="
      cn(tableStyles.head, props.pinned && tableStyles.pinned, props.pinnedEdge && tableStyles.pinnedEdge, props.class)
    "
  >
    <slot />
  </th>
</template>
