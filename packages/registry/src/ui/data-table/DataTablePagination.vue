<script setup lang="ts" generic="T extends RowData">
import type { RowData } from "@tanstack/vue-table";
import { computed, type HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";
import type { DataTableInstance } from ".";

const props = defineProps<{ table: DataTableInstance<T>; class?: HTMLAttributes["class"] }>();

const pagination = computed(() => props.table.atoms.pagination.get());
const pageCount = computed(() => props.table.getPageCount());
const total = computed(() => props.table.getRowCount());
const page = computed(() => pagination.value.pageIndex + 1);
const from = computed(() => (total.value === 0 ? 0 : pagination.value.pageIndex * pagination.value.pageSize + 1));
const to = computed(() => Math.min(total.value, (pagination.value.pageIndex + 1) * pagination.value.pageSize));
const known = computed(() => pageCount.value >= 0);

const go = (value: number) => props.table.setPageIndex(value - 1);
</script>

<template>
  <div
    data-slot="data-table-pagination"
    :class="cn('flex flex-wrap items-center justify-between gap-3 text-body-sm text-muted-foreground', props.class)"
  >
    <p v-if="known">{{ from }}–{{ to }} of {{ total }}</p>
    <p v-else>Page {{ page }}</p>
    <Pagination
      v-if="known"
      :page="page"
      :total="total"
      :items-per-page="pagination.pageSize"
      :sibling-count="1"
      show-edges
      size="sm"
      @update:page="go"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem v-for="(item, index) in items" :key="index">
          <PaginationLink v-if="item.type === 'page'" :value="item.value" />
          <PaginationEllipsis v-else />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    <div v-else class="flex gap-1">
      <Button variant="outline" size="sm" data-slot="pagination-previous" :disabled="page <= 1" @click="go(page - 1)">
        Previous
      </Button>
      <Button variant="outline" size="sm" data-slot="pagination-next" @click="go(page + 1)">Next</Button>
    </div>
  </div>
</template>
