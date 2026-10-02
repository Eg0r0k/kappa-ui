<script setup lang="ts">
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";

const regions = [
  { name: "Europe", zones: ["London", "Lisbon", "Berlin", "Warsaw", "Helsinki", "Athens"] },
  { name: "Americas", zones: ["New York", "Chicago", "Denver", "Los Angeles", "São Paulo"] },
  { name: "Asia", zones: ["Dubai", "Mumbai", "Singapore", "Tokyo"] },
];
</script>

<template>
  <Combobox default-value="Berlin">
    <ComboboxAnchor class="w-56">
      <ComboboxInput placeholder="Select a time zone" aria-label="Time zone" />
      <ComboboxTrigger />
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxViewport>
        <ComboboxEmpty>No time zone found.</ComboboxEmpty>
        <ComboboxGroup v-for="region in regions" :key="region.name">
          <ComboboxLabel>{{ region.name }}</ComboboxLabel>
          <ComboboxItem v-for="zone in region.zones" :key="zone" :value="zone">{{ zone }}</ComboboxItem>
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
