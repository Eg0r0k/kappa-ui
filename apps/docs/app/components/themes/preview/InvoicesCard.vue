<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, ref } from 'vue'

import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/ui/item'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination'

const status = (index: number) =>
  index === 0
    ? { label: 'Pending', color: 'warning' as const }
    : index === 2
      ? { label: 'Overdue', color: 'destructive' as const }
      : index % 7 === 5
        ? { label: 'Refunded', color: 'neutral' as const }
        : { label: 'Paid', color: 'success' as const }

const months = ['Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr']
const invoices = Array.from({ length: 24 }, (_, index) => ({
  id: `INV-${1042 - index}`,
  date: `${28 - (index % 4) * 7} ${months[Math.floor(index / 4)]} 2026`,
  amount: `$${(120 + ((index * 137) % 380)).toFixed(2)}`,
  status: status(index),
}))

const page = ref(1)
const perPage = 4
const pageOfInvoices = computed(() => invoices.slice((page.value - 1) * perPage, page.value * perPage))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Invoices</CardTitle>
      <CardDescription>Everything you were billed this year.</CardDescription>
    </CardHeader>
    <CardContent class="px-2">
      <ItemGroup class="gap-0.5">
        <Item v-for="invoice in pageOfInvoices" :key="invoice.id" size="sm">
          <ItemContent>
            <ItemTitle>{{ invoice.id }}</ItemTitle>
            <ItemDescription>{{ invoice.date }}</ItemDescription>
          </ItemContent>
          <ItemActions class="gap-3">
            <span class="text-label-lg tabular-nums">{{ invoice.amount }}</span>
            <Badge variant="soft" :color="invoice.status.color" class="w-18 justify-center">{{ invoice.status.label }}</Badge>
          </ItemActions>
        </Item>
      </ItemGroup>
    </CardContent>
    <CardFooter class="justify-center">
      <Pagination v-model:page="page" :total="invoices.length" :items-per-page="perPage" :sibling-count="0" show-edges size="sm">
        <PaginationContent v-slot="{ items }">
          <PaginationItem>
            <PaginationPrevious class="w-8 px-0" aria-label="Previous page">
              <ChevronLeft class="rtl:rotate-180" />
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem v-for="(item, index) in items" :key="index">
            <PaginationLink v-if="item.type === 'page'" :value="item.value" />
            <PaginationEllipsis v-else />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext class="w-8 px-0" aria-label="Next page">
              <ChevronRight class="rtl:rotate-180" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </CardFooter>
  </Card>
</template>
