<script setup lang="ts" generic="T extends RowData">
import { ArrowDown, ArrowUp, ChevronsUpDown } from "@lucide/vue";
import type { Header, RowData } from "@tanstack/vue-table";
import { computed, type HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { type DataTableFeatures, DataTableRender, injectDataTableContext } from ".";

const props = defineProps<{ header: Header<DataTableFeatures, T, unknown>; class?: HTMLAttributes["class"] }>();

const sorted = computed(() => props.header.column.getIsSorted());
const rank = computed(() => {
  const sorting = props.header.getContext().table.atoms.sorting.get();
  return sorting.length > 1 && sorted.value ? props.header.column.getSortIndex() + 1 : undefined;
});

const onClick = (event: MouseEvent) => props.header.column.getToggleSortingHandler()?.(event);

// A 28px xs row is shorter than the 32px button; at 24px it fits inside the row and its border.
const dataTable = injectDataTableContext(null);
const compact = computed(() => dataTable?.size.value === "xs");
</script>

<template>
  <Button
    variant="ghost"
    color="neutral"
    size="sm"
    data-slot="data-table-column-header"
    :data-sorted="sorted || undefined"
    :class="cn('-ms-3 text-label-md data-sorted:text-foreground', compact && 'h-6', props.class)"
    @click="onClick"
  >
    <DataTableRender :header="props.header" />
    <ArrowUp v-if="sorted === 'asc'" data-icon="inline-end" />
    <ArrowDown v-else-if="sorted === 'desc'" data-icon="inline-end" />
    <ChevronsUpDown v-else data-icon="inline-end" class="text-muted-foreground" />
    <span v-if="rank !== undefined" class="text-label-sm text-muted-foreground">{{ rank }}</span>
  </Button>
</template>
