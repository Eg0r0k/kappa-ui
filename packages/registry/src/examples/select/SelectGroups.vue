<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

const regions = [
  { name: "Europe", zones: ["London", "Lisbon", "Berlin", "Warsaw", "Helsinki", "Athens"] },
  { name: "Americas", zones: ["New York", "Chicago", "Denver", "Los Angeles", "São Paulo"] },
  { name: "Asia", zones: ["Dubai", "Mumbai", "Singapore", "Tokyo"] },
];
</script>

<template>
  <Select default-value="Berlin">
    <SelectTrigger class="w-56" aria-label="Time zone">
      <SelectValue />
    </SelectTrigger>
    <SelectContent class="max-h-72">
      <template v-for="(region, index) in regions" :key="region.name">
        <SelectSeparator v-if="index > 0" />
        <SelectGroup>
          <SelectLabel>{{ region.name }}</SelectLabel>
          <SelectItem v-for="zone in region.zones" :key="zone" :value="zone">{{ zone }}</SelectItem>
        </SelectGroup>
      </template>
    </SelectContent>
  </Select>
</template>
