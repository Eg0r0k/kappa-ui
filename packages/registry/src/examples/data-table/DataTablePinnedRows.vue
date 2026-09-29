<script setup lang="ts">
import { Pin, PinOff } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { createDataTableColumnHelper, DataTable, type RowPinningState } from "@/ui/data-table";

type Runner = { bib: number; name: string; club: string; time: string };

const names = ["Ada", "Grace", "Linus", "Margaret", "Katherine", "Marie", "Alan", "Barbara", "Dennis", "Radia"];
const clubs = ["Berlin RC", "Oslo Track", "Tokyo Striders", "Lisbon Run", "Toronto Pace"];

const runners: Runner[] = Array.from({ length: 40 }, (_, index) => {
  const seconds = 2_400 + index * 47 + ((index * 13) % 40);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return {
    bib: index + 1,
    name: names[index % names.length]!,
    club: clubs[(index * 3) % clubs.length]!,
    time: `${mm}:${ss}`,
  };
});

const helper = createDataTableColumnHelper<Runner>();
const columns = helper.columns([
  helper.display({ id: "pin", size: 48, header: "" }),
  helper.accessor("bib", { header: "Bib", size: 80, meta: { align: "end" } }),
  helper.accessor("name", { header: "Name" }),
  helper.accessor("club", { header: "Club" }),
  helper.accessor("time", { header: "Time", size: 100, meta: { align: "end" } }),
]);

const rowPinning = ref<RowPinningState>({ top: ["7"], bottom: [] });
</script>

<template>
  <DataTable
    v-model:row-pinning="rowPinning"
    :data="runners"
    :columns="columns"
    :get-row-id="(row) => String(row.bib)"
    height="320px"
    sticky
    sortable
    class="w-full max-w-lg rounded-lg border"
  >
    <template #cell-pin="{ row }">
      <Button
        variant="ghost"
        color="neutral"
        size="icon-xs"
        :aria-label="row.getIsPinned() ? 'Unpin row' : 'Pin row to the top'"
        :aria-pressed="row.getIsPinned() !== false"
        @click="row.pin(row.getIsPinned() ? false : 'top')"
      >
        <PinOff v-if="row.getIsPinned()" />
        <Pin v-else />
      </Button>
    </template>
  </DataTable>
</template>
