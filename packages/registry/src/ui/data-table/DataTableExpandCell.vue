<script setup lang="ts" generic="T extends RowData">
import { ChevronRight } from "@lucide/vue";
import type { RowData } from "@tanstack/vue-table";

import { Button } from "@/ui/button";
import { type DataTableRow } from ".";

const props = defineProps<{ row: DataTableRow<T> }>();

// A 28px xs row leaves 21px inside its cell padding: the 28px toggle would grow the row, a 20px one fits.
</script>

<template>
  <span
    data-slot="data-table-expand-cell"
    class="flex items-center"
    :style="{ paddingInlineStart: `${props.row.depth * 1.25}rem` }"
  >
    <Button
      v-if="props.row.getCanExpand() && !props.row.getIsGrouped()"
      variant="ghost"
      color="neutral"
      size="icon-xs"
      :aria-expanded="props.row.getIsExpanded()"
      aria-label="Toggle details"
      class="size-[var(--table-toggle,var(--control-height-xs))] [&_svg]:transition-transform [&_svg]:duration-short-4 [&_svg]:ease-standard aria-expanded:[&_svg]:rotate-90 motion-reduce:[&_svg]:transition-none"
      @click.stop="props.row.toggleExpanded()"
    >
      <ChevronRight />
    </Button>
  </span>
</template>
