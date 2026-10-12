<script setup lang="ts">
import { shallowRef } from "vue";

import { DataTree } from "@/ui/data-tree";

type Region = { id: string; label: string; children?: Region[] };

const regions: Region[] = Array.from({ length: 100 }, (_, r) => ({
  id: `region-${r}`,
  label: `Region ${String(r + 1).padStart(3, "0")}`,
  children: Array.from({ length: 100 }, (_, s) => ({
    id: `region-${r}/store-${s}`,
    label: `Store ${r + 1}-${String(s + 1).padStart(3, "0")}`,
  })),
}));

const expanded = shallowRef(regions.map((region) => region.id));
const store = shallowRef<Region>();
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <DataTree
      v-model="store"
      v-model:expanded="expanded"
      :items="regions"
      virtualize
      variant="outline"
      aria-label="Stores"
      class="h-80"
    />
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ store ? store.label : "10,100 nodes, about 20 rendered. Try End, or type a name." }}
    </p>
  </div>
</template>
