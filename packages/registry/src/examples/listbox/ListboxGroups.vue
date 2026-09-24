<script setup lang="ts">
import { ref } from "vue";

import { Listbox, ListboxGroup, ListboxGroupLabel, ListboxItem, ListboxSeparator } from "@/ui/listbox";

const regions = [
  { name: "Europe", zones: ["London", "Berlin", "Helsinki"] },
  { name: "Americas", zones: ["New York", "Chicago", "São Paulo"] },
];
const zone = ref("Berlin");
</script>

<template>
  <Listbox v-model="zone" aria-label="Time zone" class="w-56">
    <template v-for="(region, index) in regions" :key="region.name">
      <ListboxSeparator v-if="index > 0" />
      <ListboxGroup>
        <ListboxGroupLabel>{{ region.name }}</ListboxGroupLabel>
        <ListboxItem v-for="item in region.zones" :key="item" :value="item">{{ item }}</ListboxItem>
      </ListboxGroup>
    </template>
  </Listbox>
</template>
