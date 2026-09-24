<script setup lang="ts">
import { computed, ref } from "vue";

import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/ui/menu";
import { ScrollArea } from "@/ui/scroll-area";

const files = Array.from({ length: 10000 }, (_, index) => `photo-${String(index + 1).padStart(5, "0")}.jpg`);
const picked = ref<number>();
const pickedName = computed(() => (picked.value === undefined ? "" : files[picked.value]));
const last = ref("nothing yet");

const pick = (event: MouseEvent) => {
  const row = (event.target as Element).closest<HTMLElement>("[data-index]");
  picked.value = row ? Number(row.dataset.index) : undefined;
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-2">
    <div class="rounded-xl border" @contextmenu="pick">
      <ScrollArea :items="files" :virtualize="{ estimateSize: 36 }" class="h-64">
        <template #default="{ item, index }">
          <div :data-index="index" class="flex h-9 items-center px-3 text-body-md select-none hover:bg-muted">
            {{ item }}
          </div>
        </template>
      </ScrollArea>
      <Menu context-menu class="w-52">
        <MenuLabel class="truncate">{{ pickedName }}</MenuLabel>
        <MenuSeparator />
        <MenuItem @select="last = `Opened ${pickedName}`">Open</MenuItem>
        <MenuItem @select="last = `Shared ${pickedName}`">Share</MenuItem>
        <MenuItem variant="destructive" @select="last = `Deleted ${pickedName}`">Delete</MenuItem>
      </Menu>
    </div>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">Last action: {{ last }}</p>
  </div>
</template>
