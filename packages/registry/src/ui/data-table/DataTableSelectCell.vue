<script setup lang="ts" generic="T extends RowData">
import type { RowData } from "@tanstack/vue-table";
import { computed } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { type DataTableRow, injectDataTableContext } from ".";

const props = defineProps<{ row: DataTableRow<T> }>();

const { selectAll } = injectDataTableContext();
const checked = computed(() => selectAll.isSelected(props.row));
const can = computed(() => props.row.getCanSelect());

let shift = false;
const onClickCapture = (event: MouseEvent) => {
  shift = event.shiftKey;
};
const onToggle = () => selectAll.toggleRow(props.row, new MouseEvent("click", { shiftKey: shift }));
</script>

<template>
  <span data-slot="data-table-select-cell" class="flex items-center justify-center" @click.capture="onClickCapture">
    <Checkbox
      :model-value="checked"
      :disabled="!can"
      aria-label="Select row"
      size="sm"
      @update:model-value="onToggle"
    />
  </span>
</template>
