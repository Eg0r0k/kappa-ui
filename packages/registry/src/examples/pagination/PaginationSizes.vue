<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="grid gap-4">
    <Pagination
      v-for="size in sizes"
      :key="size"
      :total="30"
      :items-per-page="10"
      :size="size"
      variant="outline"
      class="justify-start"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem v-for="(item, index) in items" :key="index">
          <PaginationLink v-if="item.type === 'page'" :value="item.value" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</template>
