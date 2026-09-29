<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { type DataTableSelectAll, type DataTableSelectAllLabels, defaultSelectAllLabels } from ".";

const props = defineProps<{
  mode: DataTableSelectAll;
  pageCount: number;
  totalCount: number;
  labels?: Partial<DataTableSelectAllLabels>;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{ selectAll: []; clear: [] }>();

const labels = computed<DataTableSelectAllLabels>(() => ({ ...defaultSelectAllLabels, ...props.labels }));
</script>

<template>
  <div
    data-slot="data-table-select-all-banner"
    :data-mode="props.mode"
    role="status"
    :class="
      cn('flex flex-wrap items-center justify-center gap-x-2 rounded-md bg-muted px-3 py-2 text-body-sm', props.class)
    "
  >
    <template v-if="props.mode === 'all'">
      <span>{{ labels.selected(props.totalCount) }}</span>
      <Button variant="link" size="sm" @click="emit('clear')">{{ labels.clear }}</Button>
    </template>
    <template v-else>
      <span>{{ labels.page(props.pageCount) }}</span>
      <Button variant="link" size="sm" @click="emit('selectAll')">{{ labels.all(props.totalCount) }}</Button>
    </template>
  </div>
</template>
