<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableParity, tableStyles } from ".";

const props = defineProps<{
  selected?: boolean;
  clickable?: boolean;
  parity?: TableParity;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <tr
    data-slot="table-row"
    :data-state="props.selected ? 'selected' : undefined"
    :data-clickable="props.clickable ? '' : undefined"
    :data-parity="props.parity"
    :tabindex="props.clickable ? 0 : undefined"
    :class="cn(tableStyles.row, props.class)"
  >
    <slot />
  </tr>
</template>
