<script setup lang="ts">
import { shallowRef } from "vue";

import { Button } from "@/ui/button";
import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

const rows = Array.from({ length: 10_000 }, (_, index) => `Row ${index}`);
const area = shallowRef<ScrollAreaApi | null>(null);
</script>

<template>
  <div class="grid w-full max-w-sm gap-3">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="area?.scrollTo(0, 'start')">First</Button>
      <Button size="sm" variant="outline" @click="area?.scrollTo(5000, 'center')">Row 5000</Button>
      <Button size="sm" variant="outline" @click="area?.scrollTo(rows.length - 1, 'end')">Last</Button>
    </div>
    <ScrollArea
      ref="area"
      :virtualize="{ estimateSize: 32 }"
      :items="rows"
      class="h-64 rounded-lg border"
      v-slot="{ item, index }"
    >
      <div class="px-4 text-sm leading-8">{{ index }} — {{ item }}</div>
    </ScrollArea>
  </div>
</template>
