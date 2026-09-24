<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const weights = ["Thin", "Light", "Regular", "Medium", "Semibold", "Bold", "Black"];
</script>

<template>
  <Select default-value="Medium">
    <SelectTrigger class="w-44" aria-label="Font weight">
      <SelectValue />
    </SelectTrigger>
    <SelectContent position="item-aligned">
      <SelectItem v-for="weight in weights" :key="weight" :value="weight">{{ weight }}</SelectItem>
    </SelectContent>
  </Select>
</template>
