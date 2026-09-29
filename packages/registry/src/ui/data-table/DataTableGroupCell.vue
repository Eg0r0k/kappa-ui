<script setup lang="ts" generic="T extends RowData">
import { ChevronRight } from "@lucide/vue";
import type { RowData } from "@tanstack/vue-table";

import { Button } from "@/ui/button";
import type { DataTableRow } from ".";

const props = defineProps<{ row: DataTableRow<T> }>();
</script>

<template>
  <span
    data-slot="data-table-group-cell"
    class="flex items-center gap-1"
    :style="{ paddingInlineStart: `${props.row.depth * 1.25}rem` }"
  >
    <Button
      variant="ghost"
      color="neutral"
      size="icon-xs"
      :aria-expanded="props.row.getIsExpanded()"
      aria-label="Toggle group"
      class="[&_svg]:transition-transform [&_svg]:duration-short-4 [&_svg]:ease-standard aria-expanded:[&_svg]:rotate-90 motion-reduce:[&_svg]:transition-none"
      @click.stop="props.row.toggleExpanded()"
    >
      <ChevronRight />
    </Button>
    <span class="font-medium"><slot /></span>
    <span class="text-muted-foreground">({{ props.row.getLeafRows().length }})</span>
  </span>
</template>
