<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";
</script>

<template>
  <Pagination :total="60" :items-per-page="10" :default-page="3">
    <PaginationContent v-slot="{ items }">
      <PaginationItem>
        <PaginationPrevious />
      </PaginationItem>
      <PaginationItem v-for="(item, index) in items" :key="index">
        <PaginationLink v-if="item.type === 'page'" :value="item.value" as-child>
          <a :href="`#page-${item.value}`">{{ item.value }}</a>
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationNext />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
</template>
