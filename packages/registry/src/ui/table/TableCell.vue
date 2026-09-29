<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableAlign, type TablePinned, tableStyles } from ".";

const props = defineProps<{
  align?: TableAlign;
  pinned?: TablePinned;
  pinnedEdge?: boolean;
  truncate?: boolean;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <td
    data-slot="table-cell"
    :data-align="props.align"
    :data-pinned="props.pinned"
    :data-pinned-edge="props.pinnedEdge ? '' : undefined"
    :data-truncate="props.truncate ? '' : undefined"
    :class="
      cn(tableStyles.cell, props.pinned && tableStyles.pinned, props.pinnedEdge && tableStyles.pinnedEdge, props.class)
    "
  >
    <slot />
  </td>
</template>
