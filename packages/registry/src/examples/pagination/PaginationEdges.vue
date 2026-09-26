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

const page = ref(12);
</script>

<template>
  <div class="grid justify-items-center gap-3">
    <Pagination v-model:page="page" :total="500" :items-per-page="20" show-edges :sibling-count="1">
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
    <p class="text-body-sm text-muted-foreground">Page {{ page }} of 25</p>
  </div>
</template>
