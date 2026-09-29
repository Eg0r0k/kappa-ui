<script setup lang="ts">
import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";

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
</script>

<template>
  <DataTable
    :data="people"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    sortable
    :paginate="{ pageSize: 8 }"
    class="w-full max-w-lg"
  />
</template>
