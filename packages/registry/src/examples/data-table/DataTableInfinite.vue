<script setup lang="ts">
import { ref } from "vue";

import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";

type Event = { id: number; at: string; level: "info" | "warn" | "error"; message: string };

const messages = ["Deploy finished", "Cache warmed", "Slow query", "Retrying webhook", "Disk at 80%", "Login failed"];

const page = (from: number, count: number): Event[] =>
  Array.from({ length: count }, (_, offset) => {
    const index = from + offset;
    const minutes = String(index % 60).padStart(2, "0");
    return {
      id: index + 1,
      at: `${String(9 + Math.floor(index / 60)).padStart(2, "0")}:${minutes}`,
      level: index % 11 === 0 ? "error" : index % 4 === 0 ? "warn" : "info",
      message: messages[(index * 7) % messages.length]!,
    };
  });

const events = ref<Event[]>(page(0, 60));

const loadMore = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  events.value = [...events.value, ...page(events.value.length, 30)];
  return events.value.length >= 300 ? "stop" : undefined;
};

const helper = createDataTableColumnHelper<Event>();
const columns = helper.columns([
  helper.accessor("id", { header: "#", size: 70, meta: { align: "end" } }),
  helper.accessor("at", { header: "Time", size: 90 }),
  helper.accessor("level", { header: "Level", size: 90 }),
  helper.accessor("message", { header: "Message" }),
]);
</script>

<template>
  <DataTable
    :data="events"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    height="360px"
    sticky
    virtualize
    size="sm"
    :on-load-more="loadMore"
    class="w-full max-w-lg rounded-lg border"
  >
    <template #endOfData>
      <p class="py-1 text-center text-body-sm text-muted-foreground">All {{ events.length }} events loaded.</p>
    </template>
  </DataTable>
</template>
