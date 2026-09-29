<script setup lang="ts">
import { computed, ref } from "vue";

import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableRowSelectionState,
  type DataTableSelectAll,
  type DataTableSelectionSource,
} from "@/ui/data-table";

type Person = { id: number; name: string; role: string; city: string };

const first = ["Ada", "Grace", "Linus", "Margaret", "Katherine", "Marie", "Alan", "Barbara", "Dennis", "Radia"];
const last = [
  "Lovelace",
  "Hopper",
  "Torvalds",
  "Hamilton",
  "Johnson",
  "Curie",
  "Turing",
  "Liskov",
  "Ritchie",
  "Perlman",
];
const roles = ["Engineer", "Designer", "Manager", "Analyst", "Support"];
const cities = ["Berlin", "Lisbon", "Oslo", "Tokyo", "Toronto", "Zurich"];

const people: Person[] = Array.from({ length: 45 }, (_, index) => ({
  id: index + 1,
  name: `${first[index % first.length]} ${last[(index * 7) % last.length]}`,
  role: roles[(index * 3) % roles.length]!,
  city: cities[(index * 5) % cities.length]!,
}));

const helper = createDataTableColumnHelper<Person>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("role", { header: "Role" }),
  helper.accessor("city", { header: "City" }),
]);

const selection = ref<DataTableRowSelectionState>({});
const mode = ref<DataTableSelectAll>("none");
const source = ref<DataTableSelectionSource | null>(null);

const onSelection = (state: DataTableRowSelectionState, details: { source: DataTableSelectionSource }) => {
  selection.value = state;
  source.value = details.source;
};

const count = computed(() => {
  const values = Object.values(selection.value);
  if (mode.value === "all") return people.length - values.filter((value) => value === false).length;
  return values.filter(Boolean).length;
});
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-3">
    <DataTable
      v-model:select-all="mode"
      :row-selection="selection"
      :data="people"
      :columns="columns"
      :get-row-id="(row) => String(row.id)"
      selection
      :paginate="{ pageSize: 8 }"
      @update:row-selection="onSelection"
    />
    <p class="text-body-sm text-muted-foreground">
      {{ count }} selected{{ source === null ? "" : ` · last change from the ${source}` }}
    </p>
  </div>
</template>
