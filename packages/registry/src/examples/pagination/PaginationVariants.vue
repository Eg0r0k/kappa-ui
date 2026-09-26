<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";

const looks = [
  { variant: "ghost", activeVariant: "solid" },
  { variant: "outline", activeVariant: "solid" },
  { variant: "soft", activeVariant: "solid" },
  { variant: "ghost", activeVariant: "subtle" },
  { variant: "link", activeVariant: "soft" },
] as const;
</script>

<template>
  <div class="grid gap-4">
    <div v-for="look in looks" :key="`${look.variant}-${look.activeVariant}`" class="grid gap-1.5">
      <span class="text-label-sm text-muted-foreground"
        >variant="{{ look.variant }}" active-variant="{{ look.activeVariant }}"</span
      >
      <Pagination
        :total="50"
        :items-per-page="10"
        :default-page="2"
        :variant="look.variant"
        :active-variant="look.activeVariant"
        size="sm"
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
  </div>
</template>
