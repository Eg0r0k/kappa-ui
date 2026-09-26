<script setup lang="ts">
import { ref } from "vue";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";

const page = ref(1);
</script>

<template>
  <Pagination v-model:page="page" :total="100" :items-per-page="10" show-edges :sibling-count="1">
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
</template>
